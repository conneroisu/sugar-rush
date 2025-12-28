import type { FileMutation } from '../types';

/**
 * Sort mutations into execution order:
 * 1. Creates (shallower paths first, so parent folders are created before children)
 * 2. Renames (move files around)
 * 3. Deletes (deeper paths first, so children are deleted before parents)
 */
export function orderMutations(mutations: FileMutation[]): FileMutation[] {
  const creates = mutations.filter(m => m.type === 'create');
  const renames = mutations.filter(m => m.type === 'rename' || m.type === 'move');
  const deletes = mutations.filter(m => m.type === 'delete');

  // Sort creates: shallower paths first (so parent folders exist for child files)
  const sortedCreates = [...creates].sort((a, b) => {
    const aDepth = (a.newPath?.split('/').length ?? 0);
    const bDepth = (b.newPath?.split('/').length ?? 0);
    return aDepth - bDepth;
  });

  // Sort deletes: deeper paths first (so we delete children before parents)
  const sortedDeletes = [...deletes].sort((a, b) => {
    const aDepth = a.originalPath.split('/').length;
    const bDepth = b.originalPath.split('/').length;
    return bDepth - aDepth; // Deeper first
  });

  return [...sortedCreates, ...renames, ...sortedDeletes];
}
