/* js/data.js — all portfolio content lives here (built from Mahmoud Elhadad's CV). */

window.PORTFOLIO = {
  site: {
    heroIntro:
      'Backend developer focused on PHP and Laravel. I build e-commerce platforms, including a multi-vendor ' +
      'marketplace with role-based access, event-driven email and query caching. Fourth-year IT student looking for a junior backend role.',
    aboutSummary: 'Laravel and PHP, with a focus on authorization, clean queries and performance.',
    aboutBio: [
      "I'm Mahmoud, a backend developer from Zagazig, Egypt, working mainly with PHP and Laravel. " +
        'I care about the parts of a web app that visitors never see: who is allowed to do what, how the data is queried, ' +
        'and what happens in the background after an action.',
      'Most of my projects are e-commerce platforms, from procedural PHP to Laravel 12: multi-guard authentication, ' +
        'Gates and Policies, event-driven emails, queue-ready Mailables and query caching. I try to measure what I optimize, ' +
        'for example cutting the Vendora homepage from 16 queries to 6.',
      'I am a fourth-year Information Technology student at Zagazig University (GPA 3.67 / 4.0) and completed Laravel and web ' +
        'development training at Bravo Programming Company in 2025. I am looking for a junior backend role.',
    ],
    projectsSummary: 'E-commerce platforms I built with Laravel and PHP, plus a couple of front-end sites. Open any card for the details.',
    contactSummary: 'Looking for a junior backend role? Send me a message, or reach me directly by email or phone.',
    footerTagline: 'Backend Developer (PHP / Laravel) based in Zagazig, Egypt.',
    markSamplesAsPlaceholders: false,
  },

  profile: {
    name: 'Mahmoud Elhadad',
    role: 'Backend Developer (PHP / Laravel)',
    roleShort: 'Backend Developer',
    email: 'mahmoudelhadad314@gmail.com',
    phone: '+20 109 284 2953',
    location: 'Zagazig, Egypt',
    availability: 'Open to junior backend roles',
    photo: 'assets/me.jpg',
    photoAlt: 'Portrait of Mahmoud Elhadad, wearing a black t-shirt in front of green leaves',
    links: [
      { kind: 'github', label: 'GitHub', url: 'https://github.com/Mahmoud-Elhadad' },
      { kind: 'linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/in/mahmoud-elhadad-05937a376' },
      { kind: 'whatsapp', label: 'WhatsApp', url: 'https://wa.me/201092842953' },
      { kind: 'facebook', label: 'Facebook', url: 'https://www.facebook.com/mahmoud.elhadad.18919/' },
    ],
    focus: [
      'Laravel & PHP 8 e-commerce platforms',
      'Multi-guard authentication, Gates & Policies',
      'Events, Listeners, queues & notifications',
      'Query caching & N+1 avoidance',
      'MySQL & Eloquent ORM',
    ],
    principles: [
      'Each role sees only what it should: separate guards, Gates and Policies.',
      'Cache what is read often, and invalidate it automatically.',
      'Eager loading instead of N+1 queries.',
      'Emails and notifications go through Events, Listeners and queue-ready Mailables.',
    ],
    timeline: [
      {
        type: 'Education',
        title: "Bachelor's Degree in Information Technology (IT)",
        org: 'Faculty of Computers and Informatics, Zagazig University',
        period: 'Expected 2027',
        description: 'Fourth-year student. GPA: 3.67 / 4.0.',
      },
      {
        type: 'Certification',
        title: 'Building Web Applications with PHP Laravel',
        org: 'Bravo Programming Company, Zagazig',
        period: '2025',
        description: 'Two-month training covering routing, controllers, middleware, Eloquent models and relationships, migrations and authentication. Certificate of achievement.',
      },
      {
        type: 'Certification',
        title: 'Programming Languages for Web (Br135101)',
        org: 'Bravo Programming Company, Zagazig',
        period: '2025',
        description: 'HTML5, CSS3, JavaScript, PHP, MySQL, React JS and Laravel. Certificate of achievement.',
      },
    ],
  },


  skillCategories: [
    { title: 'Backend', note: '', items: [
      { name: 'PHP', level: '' }, { name: 'OOP', level: '' }, { name: 'Laravel', level: '' },
      { name: 'RESTful APIs', level: '' }, { name: 'Caching', level: '' }, { name: 'Queues', level: '' },
    ] },
    { title: 'Database', note: '', items: [
      { name: 'MySQL', level: '' }, { name: 'Eloquent ORM', level: '' },
    ] },
    { title: 'Tools', note: '', items: [
      { name: 'Git', level: '' }, { name: 'GitHub', level: '' }, { name: 'Postman', level: '' },
    ] },
    { title: 'Frontend (basic)', note: '', items: [
      { name: 'HTML5', level: '' }, { name: 'CSS3', level: '' }, { name: 'JavaScript', level: '' },
      { name: 'jQuery', level: '' }, { name: 'Bootstrap', level: '' },
    ] },
  ],

  projects: [
    {
      id: 'vendora',
      title: 'Vendora',
      subtitle: 'Multi-vendor e-commerce platform',
      summary: 'A multi-vendor marketplace with separate admin and merchant guards, admin-approved merchant sign-up, event-driven email and cached queries.',
      categories: ['Laravel'],
      tags: ['Laravel 12', 'PHP 8.2', 'MySQL', 'Bootstrap', 'AJAX'],
      year: '', status: '', role: '',
      overview: 'A multi-vendor platform built with Laravel 12 and PHP 8.2: a storefront plus separate guards for admins and merchants.',
      problem: '', solution: '',
      sections: [
        { title: 'Roles and access', text: 'Vendora has three kinds of users: customers who shop, merchants who sell, and admins who run the platform. Admins and merchants each have their own authentication guard and their own dashboard. A merchant account has to be approved by an admin before it can be used, and once approved a merchant can manage only their own products, enforced on the server with Gates and Policies.' },
        { title: 'Emails and notifications', text: 'When someone registers a new account, an Event is fired and two Listeners react to it: one sends the new user a welcome email, the other sends a Notification to the admins. The welcome email is a queue-ready Mailable, so it can move to a background queue without changing the application code, and admins receive the Notification both in the database and by mail.' },
        { title: 'Performance', text: 'The homepage originally loaded 65 models in 16 queries. Products, best-sellers and categories are now cached for one hour and the cache is invalidated automatically when the data changes, and relationships are eager loaded to avoid N+1 queries. The homepage now needs 6 queries and loads 5 models.' },
        { title: 'Database', text: 'The schema has 11 custom tables on top of the ones Laravel ships with, built with migrations and queried through Eloquent.' },
        { title: 'Storefront and dashboard', text: 'Customers get search, filters, sorting, pagination, a cart and a wishlist. Merchants and admins manage products through dashboard CRUD with multi-image upload.' },
      ],
      features: [
        'Gates and Policies so merchants manage only their own products, with admin-approved sign-up',
        'Event-driven email with Events, Listeners and queue-ready Mailables',
        'Welcome email to new users and a database + mail Notification to admins on every registration',
        'Products, best-sellers and categories cached for 1 hour with auto-invalidation, plus eager loading to avoid N+1 queries',
        'Storefront with search, filters, sorting, pagination, cart and wishlist',
        'Dashboard CRUD with multi-image upload',
      ],
      results: 'Homepage queries cut from 16 to 6, and loaded models from 65 to 5.',
      highlights: ['Queries 16 → 6', 'Loaded models 65 → 5', '11 custom tables'],
      links: { demo: '', repo: 'https://github.com/Mahmoud-Elhadad/Laravel_vendora_ecommerce', caseStudy: '' },
      sample: false,
    },
    {
      id: 'laravel-ecommerce',
      title: 'Laravel E-Commerce Platform',
      subtitle: 'Two versions with different UI designs',
      summary: 'An e-commerce platform built twice with different UI designs, using dual-guard authentication, middleware, Form Requests and eager loading.',
      categories: ['Laravel'],
      tags: ['Laravel 12', 'PHP 8.2', 'MySQL', 'AJAX', 'Bootstrap'],
      year: '', status: '', role: '',
      overview: 'An e-commerce platform built with Laravel 12 and PHP 8.2 in two versions (Porto and Ludis) with different UI designs.',
      problem: '', solution: '',
      sections: [
        { title: 'Two versions, one idea', text: 'The same e-commerce platform was built twice on Laravel 12 and PHP 8.2 with two different UI designs, Porto and Ludis. That meant keeping the backend logic clean enough to sit behind two different front ends.' },
        { title: 'Authentication and validation', text: 'Dual-guard authentication separates storefront users from admins. Middleware protects the admin area and Form Requests keep validation out of the controllers. Relationships are eager loaded to avoid N+1 queries.' },
        { title: 'Cart and wishlist', text: 'Customers can add products to a cart and a wishlist, with live totals and quantity updates. The Porto version uses AJAX so the page does not reload.' },
        { title: 'Admin panel', text: 'Admins manage products, categories and other admins through CRUD screens, and read customer messages in an inbox.' },
      ],
      features: [
        'Dual-guard authentication, middleware, Form Requests and eager loading',
        'Cart and wishlist with live totals and quantity updates, using AJAX in the Porto version',
        'Admin CRUD for products, categories and admins',
        'Messages inbox in the admin panel',
      ],
      results: '', highlights: [],
      links: { demo: '', repo: 'https://github.com/Mahmoud-Elhadad/Laravel_porto_ecommerce', caseStudy: '' },
      extraLinks: [
        { label: 'Porto version', url: 'https://github.com/Mahmoud-Elhadad/Laravel_porto_ecommerce' },
        { label: 'Ludis version', url: 'https://github.com/Mahmoud-Elhadad/Laravel_ludis_ecommerce' },
      ],
      sample: false,
    },
    {
      id: 'emart',
      title: 'eMart',
      subtitle: 'E-commerce web application in PHP',
      summary: 'An e-commerce platform built from scratch in PHP with live search, per-user star ratings, an AJAX cart and a role-protected admin dashboard.',
      categories: ['PHP'],
      tags: ['PHP', 'MySQL', 'AJAX', 'Bootstrap'],
      year: '', status: '', role: '',
      overview: 'An e-commerce platform built from scratch with PHP and MySQL.',
      problem: '', solution: '',
      sections: [
        { title: 'Built from scratch', text: 'eMart is written in plain PHP with MySQL, without a framework: session-based login, product pagination, live search and an AJAX-powered shopping cart. Customers can rate products with a star rating, one rating per user.' },
        { title: 'Admin dashboard', text: 'A role-protected dashboard gives admins CRUD for products (with multi-image upload), users and categories.' },
        { title: 'Security fixes', text: 'While testing I found and fixed security bugs, including unauthorized manipulation of the cart and of ratings.' },
      ],
      features: [
        'Session-based login, product pagination and live search',
        'Per-user star ratings and an AJAX-powered shopping cart',
        'Role-protected admin dashboard with CRUD for products (multi-image upload), users and categories',
        'Fixed security bugs such as unauthorized cart and rating manipulation',
      ],
      results: '', highlights: [],
      links: { demo: '', repo: 'https://github.com/Mahmoud-Elhadad/Php_project_internshep_emart', caseStudy: '' },
      sample: false,
    },
    {
      id: 'ecommerce-admin',
      title: 'E-Commerce with Admin Dashboard',
      subtitle: 'Procedural PHP and MySQLi',
      summary: 'A store with an admin dashboard in procedural PHP, MySQL (MySQLi) and Bootstrap on XAMPP.',
      categories: ['PHP'],
      tags: ['PHP', 'MySQL', 'Bootstrap', 'JavaScript'],
      year: '', status: '', role: '',
      overview: 'An e-commerce store with an admin dashboard using procedural PHP, MySQL (MySQLi) and Bootstrap on XAMPP.',
      problem: '', solution: '',
      sections: [
        { title: 'Stack', text: 'Built with procedural PHP, MySQL through MySQLi and Bootstrap, running on XAMPP.' },
        { title: 'Storefront', text: 'Pages for products, product details, cart, checkout, registration and login.' },
        { title: 'Admin and security', text: 'Admin-only session authentication protects the dashboard. Admins manage products (multi-image upload, categories, stock and sale price) and users with roles. Passwords are hashed with password_hash and phone numbers are validated against the Egyptian format.' },
      ],
      features: [
        'Storefront pages for products, details, cart, checkout, registration and login',
        'Admin-only session authentication',
        'CRUD for products (multi-image upload, categories, stock, sale price) and users with roles',
        'password_hash and Egyptian phone number validation',
      ],
      results: '', highlights: [],
      links: { demo: '', repo: 'https://github.com/Mahmoud-Elhadad/Php_project_internshep_ecomm', caseStudy: '' },
      sample: false,
    },
    {
      id: 'food-store',
      title: 'Food Store',
      subtitle: 'Front-end e-commerce website',
      summary: 'A responsive front-end e-commerce site with a product gallery, a sidebar shopping cart with running total, animated sign-in and sign-up forms, a Slick carousel and a deals countdown.',
      categories: ['Frontend'],
      tags: ['HTML5', 'CSS3', 'JavaScript', 'jQuery', 'Slick Slider'],
      year: '', status: '', role: '',
      overview: 'A front-end e-commerce demo built with HTML, CSS, vanilla JavaScript and jQuery, with a responsive layout for desktop, tablet and mobile. It is published on GitHub Pages.',
      problem: '', solution: '',
      sections: [
        { title: 'Shopping cart', text: 'Products in the gallery (with images, ratings, original and discounted prices) can be added to a cart. The cart opens as a sidebar with a running total and an item counter.' },
        { title: 'Sign in and sign up', text: 'Sign-in and sign-up forms with social login options and an animated switch between the two.' },
        { title: 'Pages and sections', text: 'Three pages: home, products and contact. Other sections include a product carousel built with Slick Slider, services, a countdown for the deals of the week, a blog, a newsletter sign-up, and contact details with an embedded Google Map.' },
      ],
      features: [
        'Responsive layout for desktop, tablet and mobile',
        'Product gallery with ratings and sale prices',
        'Sidebar shopping cart with running total and item counter',
        'Sign-in and sign-up forms with animated switching',
        'Slick carousel, deals countdown and newsletter form',
      ],
      results: '', highlights: [],
      links: { demo: 'https://mahmoud-elhadad.github.io/FrontEnd_project_food-Store/', repo: 'https://github.com/Mahmoud-Elhadad/FrontEnd_project_food-Store', caseStudy: '' },
      sample: false,
    },
    {
      id: 'vidmo',
      title: 'Vidmo',
      subtitle: 'Responsive site for a video production company',
      summary: 'A frontend-only, responsive movie and video production website with multi-level navigation, a video gallery and a team section.',
      categories: ['Frontend'],
      tags: ['HTML5', 'CSS3', 'Bootstrap', 'Font Awesome'],
      year: '', status: '', role: '',
      overview: 'A responsive movie and video production website built with HTML, CSS and Bootstrap, without any custom JavaScript. It is frontend only and published on GitHub Pages.',
      problem: '', solution: '',
      sections: [
        { title: 'Navigation and styling', text: 'A multi-level navigation menu, with colors defined in a single stylesheet (styles/design.css) so the look is easy to change.' },
        { title: 'Sections', text: 'Hero, services, movie trailers, featured works, new releases, statistics, a video gallery, the directors, testimonials, the blog and an Instagram feed, ending in a footer with contact details and social links.' },
      ],
      features: [
        'Responsive layout',
        'Multi-level navigation menu',
        'Video gallery, services, team and testimonials sections',
        'Font Awesome 6.7.2 icons and Google Fonts (Barlow Condensed, Nunito)',
      ],
      results: '', highlights: [],
      links: { demo: 'https://mahmoud-elhadad.github.io/FrontEnd_project_vidmo/', repo: 'https://github.com/Mahmoud-Elhadad/FrontEnd_project_vidmo', caseStudy: '' },
      sample: false,
    },
  ],

  form: {
    // Subject line prefix used when the mailto: link is built.
    subjectPrefix: 'Portfolio message from',
    defaultSubject: 'Project enquiry',
    // Message length guard rails (characters).
    minMessageLength: 10,
    maxMessageLength: 4000,

    /*
     * OPTIONAL: connect a real form service later.
     *
     * GitHub Pages cannot run PHP, so a Laravel-backed form is not possible
     * on the free static host. If you want submissions to actually arrive
     * without opening an email app, sign up for a static-form service and
     * set `endpoint` below. When it is a non-empty URL, js/main.js POSTs the
     * fields to it instead of using mailto:.
     *
     *   Formspree  https://formspree.io/f/your-form-id
     *   Basin      https://usebasin.com/f/your-form-id
     *   Web3Forms  https://api.web3forms.com/submit
     *
     * Follow the provider's own docs — the POST field names sent here are
     * name, email, subject and message. Leave "" to keep mailto: behaviour.
     */
    endpoint: '',
  },
};
