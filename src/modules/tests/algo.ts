import {DB} from '../../utils/db';
import {Obj} from '../../utils/globals';

export type TestTemplate = {
  version: '1',
  time?: number,
  categorySets: CategoryOdds[],
  sections: TestSection[],
};

type TestSection = {
  name?: string,
  minQuestionCount?: number,
  questions: {
    type: 'single' | 'medium',
    count: number,
    categorySet: string,
  }[],
};

type CategoryOdds = [string, number];

type QuestionObject = {
  type: 'single' | 'medium',
  count: number,
  categorySet: CategoryOdds[],
};

const parse = (template: TestTemplate) => {
  // This array will store the data that the db handler will use
  const qos: QuestionObject[][] = [];
  // Here we will parse through each section then through each question object
  for (const section of template.sections) {
    const s = [];
    for (const question of section.questions)
      s.push(
        {
          type: question.type,
          count: question.count,
          categorySet: template.categorySets[question.categorySet],
        },
      );
    qos.push(s);
  }

  return qos;
};

const retrieve = (sections: QuestionObject[][]) => {
  const when = ([id, weight]: CategoryOdds) => `
    WHEN '${id}' = ANY(array_agg(cat.id)) THEN ${weight}
  `;

  const single = (qo: QuestionObject, sectionNums: [number, number]) => `
    (
      SELECT
        q.id,
        q.question,
        q.answers,
        q."correctAnswers",
        ${sectionNums[0]} as section,
        ${sectionNums[1]} as subsection,
        NULL AS medium
      FROM
      (
        SELECT q.*, array_agg(cat.id) AS categories,
        CASE
          ${qo.categorySet.map(when).join('')}
        END AS weight
        FROM question q

        INNER JOIN category_closure c
        ON c.D = q."categoryId"

        INNER JOIN category cat
        ON c.a = cat.id

        WHERE q."verifiedLevel" = 1 AND q."mediumId" IS NULL

        GROUP BY q.id
      ) AS q
      WHERE weight IS NOT NULL
      ORDER BY -LOG(1.0 - random()) / weight
      LIMIT ${qo.count}
    )
  `;

  const medium = (qo: QuestionObject, sectionsNums: [number, number]) => `
    (
      SELECT
        q2.id,
        q2.question,
        q2.answers,
        q2."correctAnswers",
        ${sectionsNums[0]} as section,
        ${sectionsNums[1]} as subsection,
        mediumJSON AS medium
      FROM
      (
        SELECT DISTINCT ON(q."mediumId") q."mediumId" distinctmid, to_json(m) AS mediumJSON, q.* FROM (
          SELECT q.*, array_agg(cat.name ORDER BY c.depth DESC) AS categories,
          CASE
            ${qo.categorySet.map(when).join('')}
          END AS weight
          FROM question q

          INNER JOIN category_closure c
          ON c.D = q."categoryId"

          INNER JOIN category cat
          ON c.a = cat.id

          WHERE q."verifiedLevel" = 1 AND q."mediumId" IS NOT NULL

          GROUP BY q.id
        ) AS q

        INNER JOIN medium m
        ON q."mediumId" = m.id

        WHERE weight IS NOT NULL
        ORDER BY q."mediumId", -LOG(1.0 - random()) / weight
        LIMIT ${qo.count}
      ) AS qm

      
      INNER JOIN question q2
      ON qm."mediumId" = q2."mediumId"
    )
  `;

  const singleOrMedium = (qo: QuestionObject, sections: [number, number]) =>
    ({single, medium}[qo.type](qo, sections));

  return DB.conn().query(`
    ${/* orders by sections and groupss by medium */ ''}
    SELECT
    CASE
      WHEN (json_agg(medium))->0->'id' IS NULL THEN (json_agg(json_build_object(
        'id', id,
        'question', question,
        'answers', answers,
        'correctAnswers', "correctAnswers"
      )))->0
    END AS question,
    CASE
      WHEN (json_agg(medium))->0->'id' IS NOT NULL THEN json_agg(json_build_object(
        'id', id,
        'question', question,
        'answers', answers,
        'correctAnswers', "correctAnswers"
      ))
    END
    AS questions,
    (nullif((json_agg(medium))->>0, 'null'))::json AS medium,
    section,
    subsection
    FROM (
      ${/* removes dupes */ ''}
      SELECT DISTINCT ON (id) id _id, * FROM (
        ${sections.map((s, i) => s.map((q, j) => singleOrMedium(q, [i, j])).join(' UNION ALL ')).join(' UNION ALL ')}
      ) AS _
    ) AS _
    GROUP BY coalesce((medium->>'id')::uuid, id), section, subsection
    ORDER BY section, subsection
  `);
};

type Overwrite<A, B> = Pick<A, Exclude<keyof A, keyof B>> & B;

const assemble = (
  template: TestTemplate,
  raw: (
    ({question: Obj} | {questions: Obj, medium: Obj})
    & {section: number, subsection: number}
  )[],
) => {
  const test = {...template} as Overwrite<typeof template, {sections: Obj[]}>;

  for (const s of test.sections)
    s.questions = [];
  
  for (const row of raw)
    test.sections[row.section].questions.push(row);

  return test;
};

export const makeTest = async (template: TestTemplate) => {
  const qos = parse(template);
  const raw = await retrieve(qos);
  return assemble(template, raw);
};
