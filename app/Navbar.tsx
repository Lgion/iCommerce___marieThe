import Link from 'next/link';
import { SignInButton, Show, UserButton } from '@clerk/nextjs';

export default function Navbar() {
  return (
    <nav className="headerBlock">
      <Link href="/" className="headerBlock__home"><img src="/icommerce.png" alt="" /></Link>
      <div className="headerBlock__log">
        <Show when="signed-out">
          <SignInButton mode="modal">
            <button className="headerBlock__logBtn">
              Se connecter
            </button>
          </SignInButton>
        </Show>
        <Show when="signed-in">
          <UserButton />
        </Show>
      </div>
    </nav>
  );
}
