import Link from 'next/link';
import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs';

export default function Navbar() {
  return (
    <nav className="headerBlock">
      <Link href="/" className="headerBlock__home">iCommerce</Link>
      <div className="headerBlock__log">
        {/* <Link href="/products" className="hover:text-blue-600">Produits</Link> */}
        {/* <Link href="/services" className="hover:text-blue-600">Services</Link> */}
        <SignedOut>
          <SignInButton mode="modal">
            <button className="headerBlock__logBtn">
              Se connecter
            </button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
      </div>
    </nav>
  );
}
