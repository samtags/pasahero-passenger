/**
 * @typedef Props
 * @property {boolean} condition
 * @property {React.ReactNode} children
 *
 * @param {Props} props
 * @returns
 */
export default function Optional(props) {
  const { condition, children } = props;

  if (condition) return children;

  return null;
}
