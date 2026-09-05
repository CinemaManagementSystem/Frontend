import React, { useState } from 'react';
import { Sparkles, Ticket, Utensils, Crown, Calendar, Check, X, ChevronDown, ChevronUp, ShieldCheck, CreditCard, QrCode } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Modal } from '@/components/ui/Modal/Modal';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' as const } }
};

export const PremierePage: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<'MONTHLY' | 'ANNUAL'>('ANNUAL');
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'CREDIT_CARD' | 'QR_CODE' | 'PAYPAL'>('CREDIT_CARD');

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: 'Can I cancel my membership at any time?',
      a: 'Yes, you can cancel your membership at any time with a single click from your profile settings. You will retain access to your benefits until the end of your current billing period with zero cancellation fees.'
    },
    {
      q: 'How do the free monthly tickets work?',
      a: 'On the 1st of each month, 1 ticket credit is automatically loaded into your digital account. Credits can be redeemed for any standard, 3D, or IMAX screening. Unused credits roll over for up to 6 months.'
    },
    {
      q: 'Which locations include the VIP lounge?',
      a: 'All of our flagship locations including Cinematique Grand Central, City Center, and Sunset Strip feature full Premiere VIP lounges with private bars and complimentary snacks for Premiere members.'
    }
  ];

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleJoinClick = (plan: 'MONTHLY' | 'ANNUAL') => {
    setSelectedPlan(plan);
    setIsJoinModalOpen(true);
  };

  const handleConfirmMembership = () => {
    setIsJoinModalOpen(false);
    setIsSuccessModalOpen(true);
  };

  return (
    <div className="pb-24 bg-background min-h-screen text-foreground selection:bg-yellow-500 selection:text-black">
      {/* 1. Hero Section */}
      <section className="relative w-full overflow-hidden min-h-[580px] flex items-center justify-center py-20 border-b border-border bg-gradient-to-b from-muted/70 via-card/40 to-transparent dark:from-zinc-950 dark:via-[#121214] dark:to-[#0f0f10]">
        {/* Background Image of auditorium */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1600&q=80"
            alt="Cinematique Luxury Auditorium"
            className="w-full h-full object-cover object-center opacity-25 filter brightness-75 contrast-125"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/70 to-transparent dark:from-[#0f0f10] dark:via-[#0f0f10]/80 dark:to-transparent" />
          <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/20 to-black/60 dark:via-black/40 dark:to-black" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-yellow-500/10">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            <span>EXCLUSIVE MEMBERSHIP</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight text-foreground leading-none">
            Join the <span className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent">Premiere Circle</span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed font-normal">
            Experience cinema as it was intended to be: private lounges, luxury recliner seats, and the ultimate theater experience curated for movie aficionados.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => handleJoinClick('ANNUAL')}
              className="py-3.5 px-8 rounded-xl bg-[#E50914] hover:bg-[#ff1f2d] text-white text-xs font-black uppercase tracking-wider transition-all shadow-xl shadow-[#E50914]/30 hover:scale-105 cursor-pointer"
            >
              Start Your Membership
            </button>
            <button
              onClick={() => scrollToSection('benefits')}
              className="py-3.5 px-8 rounded-xl bg-muted hover:bg-accent border border-border text-muted-foreground hover:text-foreground text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
            >
              Learn More
            </button>
          </div>
        </motion.div>
      </section>

      {/* 2. Elevated Membership Benefits */}
      <section id="benefits" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-3 mb-14">
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-foreground">
            Elevated Membership Benefits
          </h2>
          <div className="w-12 h-1 bg-[#E50914] mx-auto rounded-full" />
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {/* Card 1 */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -4 }}
            className="p-6 rounded-3xl bg-card border border-border space-y-4 hover:border-border transition-all"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
              <Ticket className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-foreground uppercase tracking-tight">
              1 Free Ticket Monthly
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              One free standard or IMAX ticket per month, rolls over for up to 6 months.
            </p>
          </motion.div>

          {/* Card 2 */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -4 }}
            className="p-6 rounded-3xl bg-card border border-border space-y-4 hover:border-border transition-all"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
              <Utensils className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-foreground uppercase tracking-tight">
              20% Off Concessions
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Save on our fresh gourmet snacks and drinks with exclusive member pricing on every visit.
            </p>
          </motion.div>

          {/* Card 3 */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -4 }}
            className="p-6 rounded-3xl bg-card border border-border space-y-4 hover:border-border transition-all"
          >
            <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400">
              <Crown className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-foreground uppercase tracking-tight">
              VIP Lounge Access
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Relax in our private luxury lounge with complimentary beverages at flagship locations.
            </p>
          </motion.div>

          {/* Card 4 */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -4 }}
            className="p-6 rounded-3xl bg-card border border-border space-y-4 hover:border-border transition-all"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-foreground uppercase tracking-tight">
              Advanced Booking
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Get exclusive early access to buy tickets 48 hours before general public release.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* 3. Choose Your Premiere Experience (Pricing Cards) */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center space-y-2 mb-12">
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-foreground">
            Choose Your Premiere Experience
          </h2>
          <p className="text-xs text-muted-foreground">
            No hidden fees. Cancel anytime.
          </p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch"
        >
          {/* Monthly Card */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -4 }}
            className="p-8 rounded-3xl bg-card border border-border flex flex-col justify-between space-y-8 hover:border-border transition-all"
          >
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest block">
                  Monthly Plan
                </span>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-4xl font-black text-foreground">$19.99</span>
                  <span className="text-xs text-muted-foreground">/ mo</span>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-border text-xs text-muted-foreground">
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>1 Free Ticket Monthly</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>15% Concession Discount</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Standard Lounge Access</span>
                </div>
                <div className="flex items-center gap-2.5 text-muted-foreground opacity-60">
                  <X className="w-4 h-4 shrink-0" />
                  <span>No VIP Recliner Upgrades</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleJoinClick('MONTHLY')}
              className="w-full py-3.5 rounded-xl border border-border hover:border-border hover:bg-muted text-foreground text-xs font-bold uppercase tracking-wider transition-all"
            >
              Start Monthly
            </button>
          </motion.div>

          {/* Annual Card (Best Value) */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -4 }}
            className="p-8 rounded-3xl bg-card border-2 border-yellow-500 flex flex-col justify-between space-y-8 relative shadow-2xl shadow-yellow-500/10"
          >
            {/* Best Value Badge */}
            <div className="absolute -top-3.5 right-6 px-3 py-1 rounded-full bg-yellow-400 text-black text-[9px] font-black uppercase tracking-widest shadow-md">
              BEST VALUE
            </div>

            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold text-yellow-400 uppercase tracking-widest block">
                  Annual Pass
                </span>
                <div className="flex items-baseline gap-1 mt-2">
                  <span className="text-4xl font-black text-foreground">$199.99</span>
                  <span className="text-xs text-muted-foreground">/ yr</span>
                </div>
                <span className="text-xs font-bold text-emerald-400 mt-1 block">
                  Save $40 per year!
                </span>
              </div>

              <div className="space-y-3 pt-4 border-t border-border text-xs text-foreground">
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-semibold">12 Tickets + 2 Bonus Tickets (14 Total)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>25% Concession Discount</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Unlimited VIP Lounge & Suite Access</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Free Popcorn on every visit</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Exclusive Opening Night Invitations</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleJoinClick('ANNUAL')}
              className="w-full py-3.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-black uppercase tracking-wider transition-all shadow-xl shadow-yellow-500/20"
            >
              Become a Premiere Member
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* 4. Compare Membership Table */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center space-y-2 mb-10">
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-foreground">
            Compare Membership
          </h2>
        </div>

        <div className="border border-border rounded-3xl overflow-hidden bg-card shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/60 dark:bg-zinc-950/60">
                  <th className="p-4 sm:p-5 font-bold text-muted-foreground uppercase tracking-wider">Features</th>
                  <th className="p-4 sm:p-5 font-bold text-muted-foreground uppercase tracking-wider text-center">Guest</th>
                  <th className="p-4 sm:p-5 font-bold text-yellow-400 uppercase tracking-wider text-center">Premiere</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr className="hover:bg-muted/80 transition-colors">
                  <td className="p-4 sm:p-5 font-semibold text-foreground">Monthly Ticket Credit</td>
                  <td className="p-4 sm:p-5 text-muted-foreground text-center">0</td>
                  <td className="p-4 sm:p-5 font-bold text-yellow-400 text-center">1 Free Ticket</td>
                </tr>
                <tr className="hover:bg-muted/80 transition-colors">
                  <td className="p-4 sm:p-5 font-semibold text-foreground">Concessions Discount</td>
                  <td className="p-4 sm:p-5 text-muted-foreground text-center">0%</td>
                  <td className="p-4 sm:p-5 font-bold text-yellow-400 text-center">20% - 25%</td>
                </tr>
                <tr className="hover:bg-muted/80 transition-colors">
                  <td className="p-4 sm:p-5 font-semibold text-foreground">Advanced Booking Head Start</td>
                  <td className="p-4 sm:p-5 text-muted-foreground text-center">—</td>
                  <td className="p-4 sm:p-5 font-bold text-yellow-400 text-center">48-Hour Head Start</td>
                </tr>
                <tr className="hover:bg-muted/80 transition-colors">
                  <td className="p-4 sm:p-5 font-semibold text-foreground">VIP Lounge Access</td>
                  <td className="p-4 sm:p-5 text-muted-foreground text-center">—</td>
                  <td className="p-4 sm:p-5 text-center">
                    <Check className="w-5 h-5 text-yellow-400 mx-auto" />
                  </td>
                </tr>
                <tr className="hover:bg-muted/80 transition-colors">
                  <td className="p-4 sm:p-5 font-semibold text-foreground">Online Ticket Service Fees</td>
                  <td className="p-4 sm:p-5 text-muted-foreground text-center">$1.50 per ticket</td>
                  <td className="p-4 sm:p-5 font-black text-emerald-400 text-center">WAIVED</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 5. Frequently Asked Questions */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center space-y-2 mb-10">
          <h2 className="text-2xl font-black uppercase tracking-tight text-foreground">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="border border-border rounded-2xl overflow-hidden divide-y divide-border bg-card">
          {faqs.map((faq, idx) => (
            <div key={idx}>
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full flex items-center justify-between p-5 text-left text-xs uppercase font-bold text-foreground hover:bg-muted/80 transition-colors focus:outline-none"
              >
                <span>{faq.q}</span>
                {openFaq === idx ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </button>
              <AnimatePresence initial={false}>
                {openFaq === idx && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="p-5 pt-0 text-[11px] text-muted-foreground leading-relaxed border-t border-border bg-muted/40 dark:bg-zinc-950/10 overflow-hidden"
                  >
                    {faq.a}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Ready to Experience More? CTA Banner */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="relative overflow-hidden rounded-3xl p-10 sm:p-14 bg-gradient-to-r from-amber-100/70 via-muted to-amber-100/70 dark:from-amber-950/40 dark:via-zinc-900 dark:to-amber-950/40 border border-yellow-500/20 text-center space-y-6 shadow-2xl">
          <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-foreground">
            Ready to Experience More?
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
            Join 150,000+ members who have upgraded their movie-going experience.
          </p>

          <div className="pt-2">
            <button
              onClick={() => handleJoinClick('ANNUAL')}
              className="py-4 px-10 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-black uppercase tracking-wider transition-all shadow-xl shadow-yellow-500/25 hover:scale-105 cursor-pointer"
            >
              Start Your Premiere Membership
            </button>
            <span className="block text-[10px] text-muted-foreground mt-3 font-medium">
              30-day money-back guarantee. No questions asked.
            </span>
          </div>
        </div>
      </section>

      {/* Join Membership Checkout Modal */}
      <Modal
        isOpen={isJoinModalOpen}
        onClose={() => setIsJoinModalOpen(false)}
        maxWidth="md"
        title={`Join Premiere Circle - ${selectedPlan === 'ANNUAL' ? 'Annual Pass' : 'Monthly Plan'}`}
      >
        <div className="space-y-5 py-2 text-xs">
          <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-between text-foreground">
            <div>
              <span className="font-bold text-yellow-400 block uppercase">
                {selectedPlan === 'ANNUAL' ? 'Annual Pass ($199.99/yr)' : 'Monthly Plan ($19.99/mo)'}
              </span>
              <span className="text-[11px] text-muted-foreground">
                {selectedPlan === 'ANNUAL' ? 'Includes 14 free ticket credits & VIP lounge access' : 'Includes 1 ticket credit/mo & 15% concessions'}
              </span>
            </div>
            <span className="text-lg font-black text-foreground">
              {selectedPlan === 'ANNUAL' ? '$199.99' : '$19.99'}
            </span>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2">
            <span className="text-xs text-muted-foreground font-medium block">
              Payment Method
            </span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'CREDIT_CARD', name: 'Credit Card', icon: CreditCard },
                { id: 'QR_CODE', name: 'QR Pay', icon: QrCode },
                { id: 'PAYPAL', name: 'PayPal', icon: ShieldCheck },
              ].map((pm) => {
                const Icon = pm.icon;
                const active = paymentMethod === pm.id;
                return (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => setPaymentMethod(pm.id as typeof paymentMethod)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-all ${
                      active
                        ? 'border-yellow-500 bg-yellow-500/10 text-foreground'
                        : 'border-border bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-yellow-400" />
                    <span>{pm.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleConfirmMembership}
            className="w-full py-3.5 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-yellow-500/20"
          >
            Confirm & Activate Membership
          </button>
        </div>
      </Modal>

      {/* Success Confirmed Modal */}
      <Modal
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
        maxWidth="sm"
        title="Welcome to Premiere Circle!"
      >
        <div className="text-center space-y-4 py-3">
          <div className="w-14 h-14 rounded-full bg-yellow-400/20 text-yellow-400 flex items-center justify-center mx-auto border border-yellow-400/30">
            <Crown className="w-8 h-8" />
          </div>

          <div>
            <h4 className="text-lg font-black text-foreground uppercase">You're Officially a Member!</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Your ticket credits and VIP lounge passes have been added to your digital wallet.
            </p>
          </div>

          <button
            onClick={() => setIsSuccessModalOpen(false)}
            className="w-full py-3 rounded-xl bg-yellow-400 text-black text-xs font-black uppercase tracking-wider"
          >
            Explore Premiere Benefits
          </button>
        </div>
      </Modal>
    </div>
  );
};
