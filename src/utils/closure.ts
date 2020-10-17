/* eslint-disable @typescript-eslint/require-await */
import {getRepository, DeepPartial} from 'typeorm';
import {DB} from './db';

interface TreeEntt<T extends Entt> {
  new(): T,
  closure: new () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [k: string]: any,
    a,
    d,
    depth,
  },
}

type Entt = {id?: string};

export const TreeUtils = <T extends Entt>(entt: TreeEntt<T>) => {
  const enttTableName = getRepository(entt).metadata.tableName;
  const closureTableName = getRepository(entt.closure).metadata.tableName;

  const queries = {
    // obsolete
    getAncestorsLateralJoin: (outer: string) => `
      SELECT c.d, json_agg(json_build_object('id', id, 'name', name)) 
      FROM ${enttTableName} entt
      INNER JOIN ${closureTableName} c
      ON c.a = entt.id
      WHERE c.d = ${outer}
      GROUP BY c.d
    `,
    getAncestors: (paramNo: number) => `
      SELECT entt.*, c.depth
      FROM ${enttTableName} entt
      JOIN ${closureTableName} c
      ON (entt.id = c.a)
      WHERE c.d = ${'$' + paramNo}
      ORDER BY c.depth DESC
    `,
    getDescendants: (paramNo: number) => `
      SELECT entt.*, c.depth
      FROM ${enttTableName} entt
      JOIN ${closureTableName} c
      ON (entt.id = c.d)
      WHERE c.a = ${'$' + paramNo}
      ORDER BY c.depth
    `,
    getDescendantsIds: (paramNo: number) => `
      SELECT entt.id
      FROM ${enttTableName} entt
      JOIN ${closureTableName} c
      ON (entt.id = c.d)
      WHERE c.a = ${'$' + paramNo}
    `,
    doubleJoinClosure: (enttAlias: string, closureAlias?: string) => `
      INNER JOIN category_closure ${closureAlias ?? 'c'}
      ON c.D = q."categoryId"

      INNER JOIN category ${enttAlias}
      ON c.a = cat.id
    `,
  };

  const getDescendants = (id: string) =>
    DB.conn().query(`
      SELECT entt.*, c.depth
      FROM ${enttTableName} entt
      JOIN ${closureTableName} c
      ON (entt.id = c.d)
      WHERE c.a = $1
      ORDER BY c.depth
    `, [id]);

  const getAncestors = (id: string) =>
    DB.conn().query(`
      SELECT entt.*, c.depth
      FROM ${enttTableName} entt
      JOIN ${closureTableName} c
      ON (entt.id = c.a)
      WHERE c.d = $1
      ORDER BY c.depth DESC
    `, [id]);

  const getRoots = async () =>
    DB.conn().query(`
      SELECT entt.*
      FROM ${enttTableName} entt
      WHERE
      entt.id NOT IN (
        SELECT c.d
        FROM ${closureTableName} c
        WHERE c.depth > 0
      )
    `);

  const isRoot = async (id: string) =>
    (await getAncestors(id)).length === 1;

  const insertTreeNode = (obj: Partial<T>, parent?: string) =>
    DB.conn().transaction('SERIALIZABLE', async em => {
      const saved = await em.getRepository(entt).save(obj as unknown as DeepPartial<T>);

      if (parent) em.query(`
        INSERT INTO ${closureTableName} (a, d, depth)
        SELECT a, '${saved.id}', depth+1
        FROM ${closureTableName}
        WHERE d = $1
        UNION ALL SELECT '${saved.id}'::uuid, '${saved.id}'::uuid, 0
      `, [parent]);

      else em.query(`
        INSERT INTO ${closureTableName} (a, d, depth)
        VALUES ('${saved.id}'::uuid, '${saved.id}'::uuid, 0)
      `);

      return saved;
    });

  const deleteTreeNode = (id: string) =>
    DB.conn().transaction('SERIALIZABLE', async em => {
      em.query(`
        DELETE FROM ${closureTableName}
        WHERE d IN (
          SELECT d
          FROM ${closureTableName}
          WHERE a = $1
        )
      `, [id]);

      em.getRepository(entt).remove({id} as T);
    });

  return {
    getDescendants,
    getAncestors,
    insertTreeNode,
    deleteTreeNode,
    isRoot,
    getRoots,
    queries,
  };
};
