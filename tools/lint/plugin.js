// The current time is the one determinism ban that oxlint has no built-in rule
// for, because it depends on the argument count. See ADR-0008.
export const meta = { name: 'local' };

const message = 'Inject a Clock instead of reading the current time (ADR-0008).';

function isDate(node) {
  return node.type === 'Identifier' && node.name === 'Date';
}

export const rules = {
  'no-current-date': {
    create(context) {
      return {
        NewExpression(node) {
          if (isDate(node.callee) && node.arguments.length === 0) context.report({ node, message });
        },
        // Date() ignores its arguments and always returns the current time.
        CallExpression(node) {
          if (isDate(node.callee)) context.report({ node, message });
        },
      };
    },
  },
};

export default { meta, rules };
