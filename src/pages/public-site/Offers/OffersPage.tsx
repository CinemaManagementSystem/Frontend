import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, HelpCircle, Check, BookOpen, ChevronDown, ChevronUp, QrCode } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' as const } }
};

interface OfferDetail {
  id: string;
  badge: string;
  title: string;
  discount: string;
  image: string;
  code: string;
  expDate: string;
  steps: {
    title: string;
    description: string;
  }[];
  terms: {
    validity: string;
    eligibility: string;
    limits: string;
  };
}

export const OffersPage: React.FC = () => {
  const shouldReduceMotion = useReducedMotion();
  // Offers database
  const offersList: OfferDetail[] = [
    {
      id: 'off-1',
      badge: 'LIMITED TIME OFFER',
      title: 'Gourmet Double Combo',
      discount: '30% Off Signature Combos',
      image: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?auto=format&fit=crop&w=1200&q=80',
      code: 'CINEMA-492-910',
      expDate: '31 Dec 2024',
      steps: [
        {
          title: 'Claim Offer',
          description: "Click the 'Claim' button to link this offer to your digital wallet or member account."
        },
        {
          title: 'Visit Theatre',
          description: 'Head to any participating Cinematique location and present your digital QR code.'
        },
        {
          title: 'Enjoy!',
          description: 'The 30% discount will be applied automatically at checkout for your Gourmet Combo.'
        }
      ],
      terms: {
        validity: 'This offer is valid until December 31, 2024. Offer must be redeemed at least 30 minutes before showtime. Limit one redemption per member per day. Not valid in conjunction with any other discount or promotion.',
        eligibility: 'Open to all registered Cinematique rewards club members. Membership status must be active at the time of redemption.',
        limits: 'Redeemable only at the concessions counter. F&B combos cannot be exchanged for cash or movie tickets.'
      }
    },
    {
      id: 'off-2',
      badge: 'MEMBERSHIP EXCLUSIVE',
      title: 'Free Large Soda Upgrade',
      discount: 'Free upgrade from Medium to Large Soda',
      image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=1200&q=80',
      code: 'CINEMA-772-104',
      expDate: '31 Dec 2024',
      steps: [
        {
          title: 'Claim Offer',
          description: 'Claim the soda upgrade token in your member rewards hub.'
        },
        {
          title: 'Visit Theatre',
          description: 'Present your digital pass when buying any regular-sized soda combo.'
        },
        {
          title: 'Enjoy!',
          description: 'Enjoy a free upgrade to a large soda with your popcorn meal combo.'
        }
      ],
      terms: {
        validity: 'Valid until Dec 31, 2024. Food purchase is required to apply the upgrade to a large soda.',
        eligibility: 'Gold and Platinum rewards tier membership levels only.',
        limits: 'One soda upgrade per customer transaction. Cannot be combined with other free offers.'
      }
    },
    {
      id: 'off-3',
      badge: 'FLASH SALE',
      title: '2-for-1 Midnight Screenings',
      discount: 'Buy 1 Get 1 Free for Late Night Shows',
      image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80',
      code: 'CINEMA-884-210',
      expDate: '15 Nov 2024',
      steps: [
        {
          title: 'Claim Offer',
          description: 'Add 2 tickets for any midnight screening (after 11 PM) to your online checkout cart.'
        },
        {
          title: 'Apply Code',
          description: 'Use your claimed digital pass code during the payment step.'
        },
        {
          title: 'Enjoy!',
          description: 'The price of the second ticket is automatically discounted to $0.'
        }
      ],
      terms: {
        validity: 'Applicable only for Friday and Saturday night shows starting after 23:00.',
        eligibility: 'Available to all registered user accounts online.',
        limits: 'Max 1 free ticket per booking transaction. Not valid for VIP or IMAX screenings.'
      }
    },
    {
      id: 'off-4',
      badge: 'EXPERIENCE UPGRADE',
      title: 'Complimentary VIP Lounge',
      discount: 'Access VIP pre-show lounges',
      image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1200&q=80',
      code: 'CINEMA-902-155',
      expDate: '31 Dec 2024',
      steps: [
        {
          title: 'Claim Offer',
          description: 'Activate the VIP lounge pass token on your digital account.'
        },
        {
          title: 'Visit Lounge',
          description: 'Show your active QR pass at the entrance of any participating Cinematique VIP lounge.'
        },
        {
          title: 'Enjoy!',
          description: 'Enjoy complimentary premium appetizers, drinks, and plush recliners before your show.'
        }
      ],
      terms: {
        validity: 'Valid for single lounge entry on the day of your ticketed showtime.',
        eligibility: 'Requires a valid same-day ticket for any movie.',
        limits: 'Subject to lounge capacity limits. First come, first served entry applies.'
      }
    },
    {
      id: 'off-5',
      badge: 'FAMILY SUNDAY',
      title: 'Kids Eat Free Sundays',
      discount: 'Free Kids F&B Combo with adult ticket purchase',
      image: 'https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?auto=format&fit=crop&w=1200&q=80',
      code: 'CINEMA-120-449',
      expDate: '29 Dec 2024',
      steps: [
        {
          title: 'Claim Offer',
          description: 'Claim the Kids F&B ticket via the offers dashboard portal.'
        },
        {
          title: 'Visit Concession',
          description: 'Order any Adult movie ticket and F&B combo on a Sunday.'
        },
        {
          title: 'Enjoy!',
          description: 'Present the QR code at concessions to receive a free junior popcorn and juice box combo.'
        }
      ],
      terms: {
        validity: 'Valid on Sundays only. Requires purchase of at least one adult F&B combo.',
        eligibility: 'Applicable for families with kids aged 12 and under.',
        limits: 'Limit one free Kids Combo per family per cinema visit.'
      }
    }
  ];

  // Active Offer State
  const [activeOffer, setActiveOffer] = useState<OfferDetail>(offersList[0]);
  const [claimedOffers, setClaimedOffers] = useState<string[]>([]);
  const [savedOffers, setSavedOffers] = useState<string[]>([]);
  const [expandedSection, setExpandedSection] = useState<'VALIDITY' | 'ELIGIBILITY' | 'LIMITS' | null>('VALIDITY');

  // Load claimed/saved state from LocalStorage
  useEffect(() => {
    const savedClaimed = localStorage.getItem('cinematique_claimed_offers');
    const savedSaved = localStorage.getItem('cinematique_saved_offers');
    if (savedClaimed) setClaimedOffers(JSON.parse(savedClaimed));
    if (savedSaved) setSavedOffers(JSON.parse(savedSaved));
  }, []);

  const handleClaimOffer = (id: string) => {
    if (claimedOffers.includes(id)) return;
    const updated = [...claimedOffers, id];
    setClaimedOffers(updated);
    localStorage.setItem('cinematique_claimed_offers', JSON.stringify(updated));
  };

  const handleSaveOffer = (id: string) => {
    let updated = [...savedOffers];
    if (savedOffers.includes(id)) {
      updated = updated.filter((item) => item !== id);
    } else {
      updated.push(id);
    }
    setSavedOffers(updated);
    localStorage.setItem('cinematique_saved_offers', JSON.stringify(updated));
  };

  const isClaimed = claimedOffers.includes(activeOffer.id);
  const isSaved = savedOffers.includes(activeOffer.id);

  const toggleSection = (section: 'VALIDITY' | 'ELIGIBILITY' | 'LIMITS') => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  const handleSelectOffer = (offer: OfferDetail) => {
    setActiveOffer(offer);
    // Reset accordion to default validity
    setExpandedSection('VALIDITY');
    // Scroll smoothly to top hero section
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="pb-24 bg-[#0f0f10] min-h-screen text-white selection:bg-[#E50914]">
      {/* 1. Main Hero Offer Section */}
      <section className="relative w-full overflow-hidden bg-gradient-to-b from-zinc-900 to-[#0f0f10] border-b border-white/5 py-12">
        {/* Background Image of concessions */}
        <div className="absolute inset-0 z-0">
          <img
            src={activeOffer.image}
            alt={activeOffer.title}
            className="w-full h-full object-cover object-center opacity-15 filter grayscale brightness-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f10] via-[#0f0f10]/95 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-12 items-center">
          {/* F&B Text Details */}
          <motion.div 
            key={activeOffer.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="flex-1 space-y-6"
          >
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-md bg-[#E50914] text-white text-[9px] font-black uppercase tracking-widest shadow-md shadow-[#E50914]/25">
                {activeOffer.badge}
              </span>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-6xl font-black text-white uppercase tracking-tight leading-none">
                {activeOffer.title}
              </h1>
              <p className="text-lg sm:text-xl font-bold text-[#E50914]">
                {activeOffer.discount}
              </p>
            </div>

            {/* Actions Claim / Save */}
            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={() => handleClaimOffer(activeOffer.id)}
                className={`py-3 px-6 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-lg ${
                  isClaimed
                    ? 'bg-emerald-500 text-white shadow-emerald-500/20 cursor-default'
                    : 'bg-[#E50914] hover:bg-[#ff1f2d] text-white shadow-[#E50914]/20 hover:scale-102 cursor-pointer'
                }`}
              >
                {isClaimed ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Claimed & Saved</span>
                  </>
                ) : (
                  <span>Claim Now</span>
                )}
              </button>

              <button
                onClick={() => handleSaveOffer(activeOffer.id)}
                className={`py-3 px-6 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                  isSaved
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                    : 'border-white/10 hover:bg-white/5 text-gray-300 hover:text-white'
                }`}
              >
                <span>{isSaved ? 'Saved for Later' : 'Save for Later'}</span>
              </button>
            </div>
          </motion.div>

          {/* Large Concession Showcase Image */}
          <div className="w-full lg:w-[480px] shrink-0 aspect-[16/10] sm:aspect-[16/9] lg:aspect-auto lg:h-72 rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative">
            <img
              src={activeOffer.image}
              alt={activeOffer.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          </div>
        </div>
      </section>

      {/* 2. Middle Body Section (How it works & Digital Pass stub) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start relative z-10">
        
        {/* Left column - 2 spans (How it works & Accordion) */}
        <div className="lg:col-span-2 space-y-10">
          {/* How it works grid */}
          <div className="space-y-6">
            <h3 className="text-lg font-black uppercase tracking-wider text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#E50914]" />
              How it Works
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {activeOffer.steps.map((step, idx) => (
                <div key={idx} className="relative bg-[#141417] border border-white/10 rounded-2xl p-5 overflow-hidden group hover:border-white/20 transition-all">
                  {/* Faded step number */}
                  <span className="absolute -bottom-6 -right-2 text-7xl font-black text-white/5 font-mono select-none group-hover:text-white/10 transition-colors">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                    {step.title}
                  </h4>
                  <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Terms & Conditions Accordion */}
          <div className="space-y-4">
            <h3 className="text-lg font-black uppercase tracking-wider text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#E50914]" />
              Terms & Conditions
            </h3>

            <div className="border border-white/10 rounded-2xl overflow-hidden divide-y divide-white/5 bg-[#141417]">
              {/* Validity & Expiration */}
              <div>
                <button
                  onClick={() => toggleSection('VALIDITY')}
                  className="w-full flex items-center justify-between p-5 text-left text-xs uppercase font-bold text-white hover:bg-white/5 transition-colors focus:outline-none"
                >
                  <span>Validity & Expiration</span>
                  {expandedSection === 'VALIDITY' ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </button>
                <AnimatePresence initial={false}>
                  {expandedSection === 'VALIDITY' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="p-5 pt-0 text-[11px] text-gray-400 leading-relaxed border-t border-white/5 bg-zinc-950/10 overflow-hidden"
                    >
                      {activeOffer.terms.validity}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Eligibility */}
              <div>
                <button
                  onClick={() => toggleSection('ELIGIBILITY')}
                  className="w-full flex items-center justify-between p-5 text-left text-xs uppercase font-bold text-white hover:bg-white/5 transition-colors focus:outline-none"
                >
                  <span>Eligibility</span>
                  {expandedSection === 'ELIGIBILITY' ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </button>
                <AnimatePresence initial={false}>
                  {expandedSection === 'ELIGIBILITY' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="p-5 pt-0 text-[11px] text-gray-400 leading-relaxed border-t border-white/5 bg-zinc-950/10 overflow-hidden"
                    >
                      {activeOffer.terms.eligibility}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Usage Limits */}
              <div>
                <button
                  onClick={() => toggleSection('LIMITS')}
                  className="w-full flex items-center justify-between p-5 text-left text-xs uppercase font-bold text-white hover:bg-white/5 transition-colors focus:outline-none"
                >
                  <span>Usage Limits</span>
                  {expandedSection === 'LIMITS' ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </button>
                <AnimatePresence initial={false}>
                  {expandedSection === 'LIMITS' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="p-5 pt-0 text-[11px] text-gray-400 leading-relaxed border-t border-white/5 bg-zinc-950/10 overflow-hidden"
                    >
                      {activeOffer.terms.limits}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Right column - 1 span (Pass Stub & Support Card) */}
        <div className="space-y-6">
          {/* Digital Pass Stub matching mockup */}
          <motion.div 
            key={activeOffer.id + isClaimed}
            initial={{ scale: 0.98, opacity: 0.9 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="bg-[#141417] border border-white/10 rounded-3xl p-6 text-center space-y-6 shadow-2xl relative overflow-hidden"
          >
            {/* Faux ticket jagged edges decor */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-[#0f0f10] rounded-r-full border-r border-white/10" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-8 bg-[#0f0f10] rounded-l-full border-l border-white/10" />

            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div className="text-left">
                <span className="text-sm font-bold text-white block uppercase tracking-wider">
                  Your Digital Pass
                </span>
                <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-0.5 block">
                  Expires {activeOffer.expDate}
                </span>
              </div>
              {/* Brand logo icon */}
              <div className="w-7 h-7 rounded-lg bg-[#E50914]/10 text-[#E50914] flex items-center justify-center font-black text-xs border border-[#E50914]/20 animate-pulse">
                C
              </div>
            </div>

            {/* QR Card Container */}
            <div className={`p-4 rounded-2xl bg-white border border-gray-200 aspect-square max-w-[200px] mx-auto flex items-center justify-center relative transition-all duration-500 ${
              isClaimed ? 'shadow-2xl shadow-emerald-500/20 ring-4 ring-emerald-500/50 scale-102' : ''
            }`}>
              {isClaimed ? (
                <div className="relative w-full h-full flex flex-col items-center justify-center gap-1 text-zinc-900">
                  <QrCode className="w-36 h-36" />
                  <span className="text-[9px] font-bold tracking-widest text-[#E50914] absolute -bottom-1">
                    CLAIMED & SAVED
                  </span>
                </div>
              ) : (
                <div className="text-center text-zinc-800 space-y-2 select-none opacity-40">
                  <QrCode className="w-28 h-28 mx-auto" />
                  <span className="text-[9px] font-bold block tracking-widest uppercase">
                    Unclaimed Pass
                  </span>
                </div>
              )}
            </div>

            {/* Code */}
            <div className="space-y-1 pt-2 border-t border-white/5">
              <span className="text-sm font-black tracking-widest text-white font-mono block">
                {isClaimed ? activeOffer.code : '••••-••••-••••'}
              </span>
              <span className="text-[9px] text-gray-400 uppercase tracking-widest font-semibold block">
                Scan at the concessions counter
              </span>
            </div>
          </motion.div>

          {/* Need Help? Card */}
          <div className="bg-[#141417] border border-white/10 rounded-3xl p-6 space-y-3 shadow-2xl">
            <h4 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-[#E50914]" />
              Need Help?
            </h4>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Having trouble claiming your offer? Our support team is available 24/7.
            </p>
            <div>
              <a
                href="#support"
                className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-[#E50914] hover:text-[#ff1f2d] hover:underline"
              >
                <span>Contact Support</span>
                <ArrowRight className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Bottom Carousel (You might also like) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 border-t border-white/5 pt-12">
        <div className="flex items-end justify-between mb-8">
          <div className="space-y-1">
            <h3 className="text-xl font-black uppercase tracking-tight text-white">
              You might also like
            </h3>
            <p className="text-xs text-gray-400">
              More exclusive rewards for your cinematic journey.
            </p>
          </div>
          <button
            onClick={() => handleSelectOffer(offersList[0])}
            className="text-[10px] font-black uppercase tracking-widest text-[#E50914] hover:text-[#ff1f2d] transition-colors focus:outline-none"
          >
            Reset Spotlight
          </button>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {offersList.map((item) => {
            const active = activeOffer.id === item.id;
            return (
              <motion.div
                key={item.id}
                variants={itemVariants}
                whileHover={shouldReduceMotion ? {} : { y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelectOffer(item)}
                className={`group flex flex-col rounded-2xl overflow-hidden bg-[#141417] border transition-all duration-300 cursor-pointer h-full ${
                  active
                    ? 'border-[#E50914]/80 shadow-lg shadow-[#E50914]/10 scale-102'
                    : 'border-white/10 hover:border-white/20 hover:scale-102'
                }`}
              >
                {/* Card thumbnail image */}
                <div className="aspect-[16/10] w-full overflow-hidden bg-zinc-950">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>

                {/* Card details */}
                <div className="p-4 flex flex-col flex-1">
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#E50914] block">
                    {item.badge}
                  </span>
                  
                  <h4 className="font-bold text-white text-sm uppercase mt-1 leading-tight group-hover:text-[#E50914] transition-colors">
                    {item.title}
                  </h4>

                  <button
                    className={`mt-6 w-full py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-widest text-center transition-all ${
                      active
                        ? 'bg-[#E50914]/10 border-[#E50914] text-[#E50914]'
                        : 'border-white/10 hover:border-white/20 text-gray-300 hover:text-white'
                    }`}
                  >
                    Details
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </section>
    </div>
  );
};
