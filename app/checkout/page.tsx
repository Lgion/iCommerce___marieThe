'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useGlobal } from '@/utils/GlobalProvider';
import Script from 'next/script';
import '@/assets/scss/components/cart/_cartPage.scss';

export default function CheckoutPage() {
  const router = useRouter();
  const { cartState, cartTotals, clearCart } = useGlobal();
  const [isLoaded, setIsLoaded] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const totalAmount = cartTotals?.subtotal ?? 0;

  useEffect(() => {
    if (!cartState?.items || cartState.items.length === 0) {
      router.push('/cart');
    }
  }, [cartState, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const payWithPaystack = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window === 'undefined' || !(window as any).PaystackPop) {
      alert("Le module de paiement n'est pas encore prêt.");
      return;
    }

    const handler = (window as any).PaystackPop.setup({
      key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_test_samplekey123', // REMPLACEZ PAR VOTRE CLÉ PUBLIQUE SECRÈTE DE TEST
      email: formData.email,
      amount: totalAmount * 100, // Paystack attend le montant en centimes (ou plus petites unités)
      currency: "XOF",
      ref: '' + Math.floor((Math.random() * 1000000000) + 1), // Générer une référence
      firstname: formData.name,
      phone: formData.phone,
      callback: function(response: any) {
        // En conditions réelles, vous devriez vérifier cette ref côté serveur
        alert('Paiement réussi ! Référence: ' + response.reference);
        clearCart();
        router.push('/');
      },
      onClose: function(){
        alert('Transaction annulée.');
      }
    });

    handler.openIframe();
  };

  if (!cartState?.items || cartState.items.length === 0) return null;

  return (
    <main className="cartPage">
      <Script src="https://js.paystack.co/v1/inline.js" onLoad={() => setIsLoaded(true)} />
      
      <header className="cartPage__header">
        <h1 className="cartPage__title">Finaliser la commande</h1>
        <p className="cartPage__summary">Montant Total à Payer : {totalAmount} XOF</p>
      </header>

      <section className="cartPage__layout" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <form onSubmit={payWithPaystack} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', background: 'white', padding: '2rem', borderRadius: '1rem', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Nom Complet</label>
            <input required type="text" name="name" value={formData.name} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ccc' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Email</label>
            <input required type="email" name="email" value={formData.email} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ccc' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Téléphone (pour Wave/Orange Money)</label>
            <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #ccc' }} />
          </div>

          <button 
            type="submit" 
            className="cartPage__checkout" 
            style={{ background: '#a57c52', marginTop: '1rem' }}
            disabled={!isLoaded}
          >
            {isLoaded ? 'Payer avec Paystack (Visa / Mobile Money)' : 'Chargement sécurisé...'}
          </button>
        </form>
      </section>
    </main>
  );
}
