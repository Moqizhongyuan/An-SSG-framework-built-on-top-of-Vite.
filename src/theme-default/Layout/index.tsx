import { Content } from '../../runtime';
import 'uno.css';

export function Layout() {
  return (
    <div>
      <h1 p="2" m="4" bg="blue" text="white">
        Common Content
      </h1>
      <h1>Doc Content</h1>
      <Content />
    </div>
  );
}
