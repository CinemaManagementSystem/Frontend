import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

export type Locale = 'en' | 'km'

interface I18nContextValue {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string) => string
}

const STORAGE_KEY = 'cinematique-locale'

const translations: Record<Locale, Record<string, string>> = {
  en: {
    // Navbar
    'nav.home': 'Home',
    'nav.movies': 'Movies',
    'nav.cinemas': 'Cinemas',
    'nav.comingSoon': 'Coming Soon',
    'nav.offers': 'Offers',
    'nav.myTickets': 'My Tickets',
    'nav.settings': 'Settings',
    'nav.signIn': 'Sign In',
    'nav.joinNow': 'Join Now',
    'nav.adminPanel': 'Admin Panel',
    'nav.adminDashboard': 'Admin Dashboard',
    'nav.signOut': 'Sign Out',
    'nav.searchMovies': 'Search Movies',
    'nav.myBookings': 'My Bookings',
    'nav.viewPublicSite': 'View Public Site',
    'nav.language': 'Language',

    // Footer
    'footer.tagline': 'Experience the pinnacle of cinema. IMAX, 3D Laser, and Dolby Atmos audio with premium VIP reclining suites.',
    'footer.location': 'Grand Avenue, Metropolis',
    'footer.movies': 'Movies',
    'footer.nowShowing': 'Now Showing',
    'footer.comingSoon': 'Coming Soon',
    'footer.imaxExperiences': 'IMAX Experiences',
    'footer.exclusivePremieres': 'Exclusive Premieres',
    'footer.cinemas': 'Cinemas',
    'footer.grandHall': 'Grand Hall IMAX',
    'footer.dolbyScreen': 'Downtown Dolby Screen',
    'footer.vipLounge': 'VIP Dine-In Lounge',
    'footer.ticketHistory': 'Ticket Booking History',
    'footer.stayConnected': 'Stay Connected',
    'footer.subscribeText': 'Subscribe for early movie access and discounts.',
    'footer.enterEmail': 'Enter email',
    'footer.join': 'Join',
    'footer.copyright': 'Cinematique Inc. All rights reserved.',
    'footer.builtWith': 'Built with',
    'footer.forMovieLovers': 'for movie lovers worldwide',

    // Sidebar (Admin)
    'sidebar.adminPortal': 'Admin Portal',
    'sidebar.mainMenu': 'Main Menu',
    'sidebar.dashboard': 'Dashboard',
    'sidebar.categories': 'Categories',
    'sidebar.movies': 'Movies',
    'sidebar.locations': 'Locations',
    'sidebar.theaters': 'Theaters',
    'sidebar.screens': 'Screens',
    'sidebar.seats': 'Seats',
    'sidebar.shows': 'Shows',
    'sidebar.bookings': 'Bookings',
    'sidebar.bookingSeats': 'Booking Seats',
    'sidebar.productCategories': 'Product Categories',
    'sidebar.products': 'Products',
    'sidebar.orders': 'Orders',
    'sidebar.orderItems': 'Order Items',
    'sidebar.payments': 'Payments',
    'sidebar.paymentTransactions': 'Payment Transactions',
    'sidebar.users': 'Users',

    // Dashboard Header
    'dashboard.overview': 'Overview & Analytics',
    'dashboard.manage': 'Manage theater schedules, movies, and box office sales',
    'dashboard.liveSystem': 'Live System',

    // Settings
    'settings.preferences': 'Preferences',
    'settings.title': 'Settings',
    'settings.description': 'Customize your Cinematique experience. Preferences are saved on this device.',
    'settings.themeMode': 'Theme Mode',
    'settings.themeDescription': 'Choose whether Cinematique uses a light or dark appearance.',
    'settings.dark': 'Dark',
    'settings.light': 'Light',
    'settings.general': 'General',
    'settings.notifications': 'Notifications',
    'settings.notificationsDesc': 'Email me about new premieres, showtimes, and exclusive offers.',
    'settings.enabled': 'Enabled',
    'settings.accountSecurity': 'Account & Security',
    'settings.accountSecurityDesc': 'Manage your password, email, and sign-in preferences.',
    'settings.comingSoon': 'Coming soon',

    // Auth
    'auth.signIn': 'Sign In',
    'auth.signUp': 'Sign Up',
    'auth.welcomeBack': 'Welcome back to Cinematique',
    'auth.signInSubtitle': 'Enter your credentials to access your account',
    'auth.email': 'Email Address',
    'auth.emailPlaceholder': 'name@example.com',
    'auth.password': 'Password',
    'auth.forgotPassword': 'Forgot password?',
    'auth.orContinueWith': 'Or continue with',
    'auth.noAccount': "Don't have an account?",
    'auth.createAccount': 'Create an account',
    'auth.createSubtitle': 'Join Cinematique for the best movie experience',
    'auth.fullName': 'Full Name',
    'auth.fullNamePlaceholder': 'John Doe',
    'auth.confirmPassword': 'Confirm Password',
    'auth.agreeTerms': 'I agree to the',
    'auth.termsOfService': 'Terms of Service',
    'auth.and': 'and',
    'auth.privacyPolicy': 'Privacy Policy',
    'auth.alreadyHaveAccount': 'Already have an account?',
    'auth.roleDemo': 'Demo Roles (click to try):',
    'auth.usernameOrEmail': 'Username or Email',
    'auth.usernamePlaceholder': 'admin or admin@cinema.com',
    'auth.passwordPlaceholder': '••••••••',
    'auth.demoAccounts': 'Demo accounts:',
    'auth.demoCredentials': 'admin / Admin123, user / User123',
    'auth.signingIn': 'Signing in...',
    'auth.username': 'Username',
    'auth.usernamePlaceholderReg': 'jane_doe',
    'auth.passwordPlaceholderReg': 'At least 6 characters',
    'auth.creatingAccount': 'Creating Account...',
    'auth.backToHome': 'Back to Home',
    'auth.copyright': 'Cinematique. All rights reserved.',
    'auth.validation.fillBoth': 'Please fill in both username/email and password',
    'auth.validation.fillAll': 'Please fill in all fields',

    // Home
    'home.premiereOfWeek': 'PREMIERE OF THE WEEK',
    'home.bookNow': 'Book Tickets Now',
    'home.watchTrailer': 'Watch Trailer',
    'home.exploreMovies': 'EXPLORE MOVIES',
    'home.exploreSubtitle': 'Select a movie to check showtimes and reserve your seats in seconds',
    'home.searchPlaceholder': 'Search by title or genre...',
    'home.allMovies': 'All Movies',
    'home.nowShowing': 'Now Showing',
    'home.featured': 'Featured',
    'home.noMoviesFound': 'No Movies Found',
    'home.resetFilters': 'Reset Filters',
    'home.experienceBest': 'EXPERIENCE THE BEST',
    'home.worldClass': 'WORLD-CLASS CINEMATIC TECHNOLOGY',
    'home.imax3d': 'IMAX 3D Laser',
    'home.imaxDesc': 'Next-generation 4K laser projection with breathtaking realism and dynamic range.',
    'home.dolbyAtmos': 'Dolby Atmos Audio',
    'home.dolbyDesc': 'Multi-dimensional sound that moves all around you with unmatched clarity and depth.',
    'home.vipSuite': 'VIP Suite Recliners',
    'home.vipDesc': 'Motorized leather recliners with in-seat food and beverage service on demand.',

    // History
    'history.ticketHistory': 'TICKET HISTORY',
    'history.subtitle': 'Review your past bookings and manage your cinema experiences',
    'history.backToMovies': 'Back to Movies',
    'history.viewTicket': 'View Ticket',
    'history.noTickets': 'No Tickets Found',
    'history.noTicketsDesc': "You haven't booked any movie tickets yet. Start exploring our cinema catalog!",
    'history.browseMovies': 'Browse Movies',

    // Movies (Public)
    'movies.discover': 'DISCOVER & WATCH',
    'movies.comingSoon': 'Coming Soon',

    // Offers
    'offers.title': 'SPECIAL OFFERS',
    'offers.subtitle': 'Grab exclusive deals on tickets, snacks, and premium experiences',

    // Premiere
    'premiere.joinCircle': 'Join the Premiere Circle',
    'premiere.exclusiveRewards': 'EXCLUSIVE REWARDS & EARLY ACCESS',
    'premiere.subtitle': 'Unlock premium cinema benefits with our loyalty membership program',
    'premiere.monthlyCredit': 'Monthly Ticket Credit',
    'premiere.concessionsDiscount': 'Concessions Discount',
    'premiere.advancedBooking': 'Advanced Booking Head Start',
    'premiere.vipLounge': 'VIP Lounge Access',
    'premiere.feeWaiver': 'Online Ticket Service Fees',
    'premiere.benefits': 'MEMBERSHIP TIER BENEFITS',
    'premiere.freeTier': 'Free',
    'premiere.silverTier': 'Silver',
    'premiere.goldTier': 'Gold',
    'premiere.platinumTier': 'Platinum',
    'premiere.selectPlan': 'SELECT YOUR PLAN',
    'premiere.monthly': 'Monthly',
    'premiere.year': 'Year',
    'premiere.joinNow': 'Join Premiere Circle',
    'premiere.memberStatus': 'YOUR MEMBER STATUS',
    'premiere.upgradeConfirm': 'Upgrade to {tier}?',
    'premiere.upgradeDesc': 'You will be charged {price}/{period} for the {tier} membership tier.',
    'premiere.confirm': 'Confirm',
    'premiere.cancel': 'Cancel',
    'premiere.congrats': "You're Officially a Member!",

    // Cinemas
    'cinemas.title': 'CINEMA FORMATS',
    'cinemas.subtitle': 'Explore our world-class screening experiences',

    // Not Found
    'notFound.title': 'Page Not Found',
    'notFound.description': "The page you're looking for doesn't exist or has been moved.",
    'notFound.backHome': 'Back to Home',

    // Common
    'common.search': 'Search',
    'common.loading': 'Loading...',
    'common.back': 'Back',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.add': 'Add',
    'common.close': 'Close',
    'common.viewAll': 'View All',
    'common.min': 'min',
    'common.rating': 'Rating',
    'common.status': 'Status',
    'common.price': 'Price',
    'common.date': 'Date',
    'common.time': 'Time',
    'common.total': 'Total',
    'common.seats': 'Seats',
    'common.showtime': 'Showtime',
    'common.bookTicket': 'Book Ticket',
    'common.movieNotFull': 'Movie Not Found',
  },

  km: {
    // Navbar
    'nav.home': 'ទំព័រដើម',
    'nav.movies': 'រឿងភាគ',
    'nav.cinemas': 'រោងកុន',
    'nav.comingSoon': 'នឹងមកដល់',
    'nav.offers': 'ការផ្តល់ជូន',
    'nav.myTickets': 'សំបុត្ររបស់ខ្ញុំ',
    'nav.settings': 'ការកំណត់',
    'nav.signIn': 'ចូល',
    'nav.joinNow': 'ចុះឈ្មោះ',
    'nav.adminPanel': 'ផ្ទាំងគ្រប់គ្រង',
    'nav.adminDashboard': 'ផ្ទាំងគ្រប់គ្រង',
    'nav.signOut': 'ចេញ',
    'nav.searchMovies': 'ស្វែងរករឿងភាគ',
    'nav.myBookings': 'ការកក់របស់ខ្ញុំ',
    'nav.viewPublicSite': 'មើលវែបសាយសាធារណៈ',
    'nav.language': 'ភាសា',

    // Footer
    'footer.tagline': 'បទពិសោធន៍ខ្ពស់បំផុតនៃរោងកុន។ IMAX 3D Laser និង Dolby Atmos ជាមួយបន្ទប់ VIP ប្រណិត។',
    'footer.location': 'មហាវិថី Grand, Metropolis',
    'footer.movies': 'រឿងភាគ',
    'footer.nowShowing': 'កំពុងចាក់បញ្ចាំង',
    'footer.comingSoon': 'នឹងមកដល់',
    'footer.imaxExperiences': 'បទពិសោធន៍ IMAX',
    'footer.exclusivePremieres': 'ការចាក់បញ្ចាំងបែបប្រណិត',
    'footer.cinemas': 'រោងកុន',
    'footer.grandHall': 'សាល Grand Hall IMAX',
    'footer.dolbyScreen': 'Dolby Screen ទីក្រុង',
    'footer.vipLounge': 'បន្ទប់ VIP Dine-In',
    'footer.ticketHistory': 'ប្រវត្តិនៃការទិញសំបុត្រ',
    'footer.stayConnected': 'ភ្ជាប់ទំនាក់ទំនង',
    'footer.subscribeText': 'ជាវដើម្បីទទួលបានសិទ្ធិចូលមុន និងការបញ្ចុះតម្លៃ។',
    'footer.enterEmail': 'បញ្ចូលអ៊ីមែល',
    'footer.join': 'ចូលរួម',
    'footer.copyright': 'Cinematique Inc. រក្សាសិទ្ធិគ្រប់យ៉ាង។',
    'footer.builtWith': 'បង្កើតដោយ',
    'footer.forMovieLovers': 'សម្រាប់អ្នកដែលស្រលាញ់រឿងភាគ',

    // Sidebar (Admin)
    'sidebar.adminPortal': 'ផ្ទាំងគ្រប់គ្រង',
    'sidebar.mainMenu': 'ម៉ឺនុយមេ',
    'sidebar.dashboard': 'ផ្ទាំងគ្រប់គ្រង',
    'sidebar.categories': 'ប្រភេទ',
    'sidebar.movies': 'រឿងភាគ',
    'sidebar.locations': 'ទីតាំង',
    'sidebar.theaters': 'រោងកុន',
    'sidebar.screens': 'អេក្រង់',
    'sidebar.seats': 'កៅអី',
    'sidebar.shows': 'ការចាក់បញ្ចាំង',
    'sidebar.bookings': 'ការកក់',
    'sidebar.bookingSeats': 'កៅអីដែលបានកក់',
    'sidebar.productCategories': 'ប្រភេទផលិតផល',
    'sidebar.products': 'ផលិតផល',
    'sidebar.orders': 'បញ្ជាទិញ',
    'sidebar.orderItems': 'មាតិកាបញ្ជាទិញ',
    'sidebar.payments': 'ការชำระប្រាក់',
    'sidebar.paymentTransactions': 'ប្រវត្តិនៃការបង់ប្រាក់',
    'sidebar.users': 'អ្នកប្រើប្រាស់',

    // Dashboard Header
    'dashboard.overview': 'ទិដ្ឋភាព និងវិភាគ',
    'dashboard.manage': 'គ្រប់គ្រងកាលវិភាគរោងកុន រឿងភាគ និងការលក់សំបុត្រ',
    'dashboard.liveSystem': 'ប្រព័ន្ធផ្សាយផ្ទាល់',

    // Settings
    'settings.preferences': 'ចំណូលចិត្ត',
    'settings.title': 'ការកំណត់',
    'settings.description': 'ប្ដូរបទពិសោធន៍ Cinematique របស់អ្នក។ ចំណូលចិត្តត្រូវបានរក្សាទុកនៅឧបករណ៍នេះ។',
    'settings.themeMode': 'របៀបបង្ហាញ',
    'settings.themeDescription': 'ជ្រើសរើសថាតើ Cinematique ប្រើរូបរាងស្រាល ឬងងឹត។',
    'settings.dark': 'ងងឹត',
    'settings.light': 'ស្រាល',
    'settings.general': 'ទូទៅ',
    'settings.notifications': 'ការជូនដំណឹង',
    'settings.notificationsDesc': 'ផ្ញើអ៊ីមែលឱ្យខ្ញុំអំពីរឿងភាគថ្មី កាលវិភាគ និងការផ្តល់ជូនប្រណិត។',
    'settings.enabled': 'បានបើក',
    'settings.accountSecurity': 'គណនី និងសុវត្ថិភាព',
    'settings.accountSecurityDesc': 'គ្រប់គ្រងពាក្យសម្ងាត់ អ៊ីមែល និងចំណូលចិត្តចូល។',
    'settings.comingSoon': 'នឹងមកដល់',

    // Auth
    'auth.signIn': 'ចូល',
    'auth.signUp': 'ចុះឈ្មោះ',
    'auth.welcomeBack': 'ស្វាគមន៍ត្រឡប់មកវិញ',
    'auth.signInSubtitle': 'បញ្ចូលព័ត៌មានសម្គាល់របស់អ្នកដើម្បីចូល',
    'auth.email': 'អ៊ីមែល',
    'auth.emailPlaceholder': 'name@example.com',
    'auth.password': 'ពាក្យសម្ងាត់',
    'auth.forgotPassword': 'ភ្លេចពាក្យសម្ងាត់?',
    'auth.orContinueWith': 'ឬបន្តជាមួយ',
    'auth.noAccount': 'មិនទាន់មានគណនី?',
    'auth.createAccount': 'បង្កើតគណនី',
    'auth.createSubtitle': 'ចូលរួម Cinematique សម្រាប់បទពិសោធន៍រឿងភាគល្អបំផុត',
    'auth.fullName': 'ឈ្មោះពេញ',
    'auth.fullNamePlaceholder': 'ឈ្មោះ និង នាម',
    'auth.confirmPassword': 'បញ្ជាក់ពាក្យសម្ងាត់',
    'auth.agreeTerms': 'ខ្ញុំយល់ព្រមទៅនឹង',
    'auth.termsOfService': 'លក្ខខណ្ឌសេវា',
    'auth.and': 'និង',
    'auth.privacyPolicy': 'គោលនយោបាយឯកជនភាព',
    'auth.alreadyHaveAccount': 'មានគណនីរួចហើយ?',
    'auth.roleDemo': 'តួនាទីសាកល្បង (ចុចដើម្បីសាកល្បង):',
    'auth.usernameOrEmail': 'ឈ្មោះអ្នកប្រើ ឬ អ៊ីមែល',
    'auth.usernamePlaceholder': 'admin or admin@cinema.com',
    'auth.passwordPlaceholder': '••••••••',
    'auth.demoAccounts': 'គណនីសាកល្បង:',
    'auth.demoCredentials': 'admin / Admin123, user / User123',
    'auth.signingIn': 'កំពុងចូល...',
    'auth.username': 'ឈ្មោះអ្នកប្រើ',
    'auth.usernamePlaceholderReg': 'jane_doe',
    'auth.passwordPlaceholderReg': 'យ៉ាងហោចណាស់ ៦ តួអក្សរ',
    'auth.creatingAccount': 'កំពុងបង្កើតគណនី...',
    'auth.backToHome': 'ត្រឡប់ទៅទំព័រដើម',
    'auth.copyright': 'Cinematique. រក្សាសិទ្ធិគ្រប់យ៉ាង។',
    'auth.validation.fillBoth': 'សូមបញ្ចូលឈ្មោះអ្នកប្រើ/អ៊ីមែល និងពាក្យសម្ងាត់',
    'auth.validation.fillAll': 'សូមបញ្ចូលគ្រប់វាលទាំងអស់',

    // Home
    'home.premiereOfWeek': 'ការចាក់បញ្ចាំងបែបប្រណិតសប្តាហ៍នេះ',
    'home.bookNow': 'កក់សំបុត្រឥឡូវនេះ',
    'home.watchTrailer': 'មើល Trailer',
    'home.exploreMovies': 'ស្វែងរករឿងភាគ',
    'home.exploreSubtitle': 'ជ្រើសរើសរឿងភាគដើម្បីមើលកាលវិភាគ និងកក់កៅអី',
    'home.searchPlaceholder': 'ស្វែងរកតាមចំណងជើង ឬប្រភេទ...',
    'home.allMovies': 'រឿងភាគទាំងអស់',
    'home.nowShowing': 'កំពុងចាក់បញ្ចាំង',
    'home.featured': 'ពិសេស',
    'home.noMoviesFound': 'រកមិនឃើញរឿងភាគ',
    'home.resetFilters': 'កំណត់ឡើងវិញ',
    'home.experienceBest': 'ទទួលបានបទពិសោធន៍ល្អបំផុត',
    'home.worldClass': 'បច្ចេកវិទ្យារោងកុនកម្រិតពិភពលោក',
    'home.imax3d': 'IMAX 3D Laser',
    'home.imaxDesc': 'ការបង្ហាញកាំរស្មី 4K ជំនាន់ថ្មីជាមួយពិភពពិតដ៏អស្ចារ្យ។',
    'home.dolbyAtmos': 'សំឡេង Dolby Atmos',
    'home.dolbyDesc': 'សំឡេងពហុវិមាត្រដែលរំកិលជុំវិញអ្នក។',
    'home.vipSuite': 'កៅអី VIP Suite',
    'home.vipDesc': 'កៅអីស្បែកដែលមានសេវាម្ហូប និងភេសជ្រើសនៅលើកៅអី។',

    // History
    'history.ticketHistory': 'ប្រវត្តិសំបុត្រ',
    'history.subtitle': 'ពិនិត្យមើលការកក់របស់អ្នកកាលពីមុន និងគ្រប់គ្រងបទពិសោធន៍រោងកុនរបស់អ្នក',
    'history.backToMovies': 'ត្រឡប់ទៅរឿងភាគ',
    'history.viewTicket': 'មើលសំបុត្រ',
    'history.noTickets': 'រកមិនឃើញសំបុត្រ',
    'history.noTicketsDesc': 'អ្នកមិនទាន់បានកក់សំបុត្ររឿងភាគនៅឡើយទេ។',
    'history.browseMovies': 'រុករករឿងភាគ',

    // Movies
    'movies.discover': 'រុករក និងមើល',
    'movies.comingSoon': 'នឹងមកដល់',

    // Offers
    'offers.title': 'ការផ្តល់ជូនពិសេស',
    'offers.subtitle': 'ទទួលបានការផ្តល់ជូនពិសេសលើសំបុត្រ អាហារ និងបទពិសោធន៍ប្រណិត',

    // Premiere
    'premiere.joinCircle': 'ចូលរួម Premiere Circle',
    'premiere.exclusiveRewards': 'រង្វាន់ប្រណិត និងសិទ្ធិចូលមុន',
    'premiere.subtitle': 'ដោះស្រាយអត្ថប្រយោជន៍រោងកុនប្រណិតជាមួយកម្មវិធីសមាជិកភាពស្មោះត្រង់របស់យើង',
    'premiere.monthlyCredit': 'ឥណទានសំបុត្រប្រចាំខែ',
    'premiere.concessionsDiscount': 'បញ្ចុះតម្លៃអាហារ',
    'premiere.advancedBooking': 'សិទ្ធិកក់មុន',
    'premiere.vipLounge': 'សិទ្ធិចូល VIP Lounge',
    'premiere.feeWaiver': 'ឥតគិតថ្លៃសេវាលក់សំបុត្រអនឡាញ',
    'premiere.benefits': 'អត្ថប្រយោជន៍សមាជិកភាព',
    'premiere.freeTier': 'ឥតគិតថ្លៃ',
    'premiere.silverTier': 'ប្រាក់',
    'premiere.goldTier': 'មាស',
    'premiere.platinumTier': 'ប្លាទីន',
    'premiere.selectPlan': 'ជ្រើសរើសផែនការរបស់អ្នក',
    'premiere.monthly': 'ប្រចាំខែ',
    'premiere.year': 'ប្រចាំឆ្នាំ',
    'premiere.joinNow': 'ចូលរួម Premiere Circle',
    'premiere.memberStatus': 'ស្ថានភាពសមាជិកភាពរបស់អ្នក',
    'premiere.upgradeConfirm': 'អាប់ហ្គ្រេដទៅ {tier}?',
    'premiere.upgradeDesc': 'អ្នកនឹងត្រូវបង់ប្រាក់ {price}/{period} សម្រាប់កម្រិតសមាជិកភាព {tier}។',
    'premiere.confirm': 'បញ្ជាក់',
    'premiere.cancel': 'បោះបង់',
    'premiere.congrats': 'អ្នកជាសមាជិកជាផ្លូវការ!',

    // Cinemas
    'cinemas.title': 'ប្រភេទរោងកុន',
    'cinemas.subtitle': 'រុករកបទពិសោធន៍ចាក់បញ្ចាំងកម្រិតពិភពលោក',

    // Not Found
    'notFound.title': 'រកមិនឃើញទំព័រ',
    'notFound.description': 'ទំព័រដែលអ្នកកំពុងស្វែងរកមិនមាន ឬត្រូវបានផ្លាស់ប្តូរ។',
    'notFound.backHome': 'ត្រឡប់ទៅទំព័រដើម',

    // Common
    'common.search': 'ស្វែងរក',
    'common.loading': 'កំពុងផ្ទុក...',
    'common.back': 'ត្រឡប់',
    'common.save': 'រក្សាទុក',
    'common.cancel': 'បោះបង់',
    'common.delete': 'លុប',
    'common.edit': 'កែសម្រួល',
    'common.add': 'បន្ថែម',
    'common.close': 'បិទ',
    'common.viewAll': 'មើលទាំងអស់',
    'common.min': 'នាទី',
    'common.rating': 'ការវាយតម្លៃ',
    'common.status': 'ស្ថានភាព',
    'common.price': 'តម្លៃ',
    'common.date': 'កាលបរិច្ឆេទ',
    'common.time': 'ពេលវេលា',
    'common.total': 'សរុប',
    'common.seats': 'កៅអី',
    'common.showtime': 'កាលវិភាគ',
    'common.bookTicket': 'កក់សំបុត្រ',
    'common.movieNotFound': 'រកមិនឃើញរឿងភាគ',
  },
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined)

export function LangProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window === 'undefined') return 'en'
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === 'en' || stored === 'km') return stored
    return 'en'
  })

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, locale)
    document.documentElement.lang = locale
  }, [locale])

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
  }, [])

  const t = useCallback(
    (key: string): string => {
      return translations[locale]?.[key] ?? translations.en[key] ?? key
    },
    [locale],
  )

  const value = useMemo<I18nContextValue>(
    () => ({ locale, setLocale, t }),
    [locale, setLocale, t],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useLanguage() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useLanguage must be used within a LangProvider')
  return ctx
}
