"use client"

import CardNav from './CardNav'

const items = [
  {
    label: "About",
    bgColor: "#0D0716",
    textColor: "#fff",
    links: [
      { label: "Company", href: "/about", ariaLabel: "About Company" },
      { label: "Careers", href: "/careers", ariaLabel: "About Careers" },
      { label: "Blog", href: "/blog", ariaLabel: "Our Blog" }
    ]
  },
  {
    label: "How it Works",
    bgColor: "#170D27",
    textColor: "#fff",
    links: [
      { label: "Features", href: "/features", ariaLabel: "Key Features" },
      { label: "Documentation", href: "/docs", ariaLabel: "Read our Documentation" }
    ]
  },
  {
    label: "Contact",
    bgColor: "#271E37",
    textColor: "#fff",
    links: [
      { label: "Email", href: "mailto:contact@neuracdn.com", ariaLabel: "Email us" },
      { label: "GitHub", href: "https://github.com/yashk40/Neuracdn", ariaLabel: "GitHub Repository" }
    ]
  }
];

// const signInButtonText = "Sign In";
// const signInButtonHref = "/signin";
// const signUpButtonText = "Sign Up";
// const signUpButtonHref = "/signup";
// const documentationButtonText = "Docs";
// const documentationButtonHref = "/docs";

export function Navbar() {
  return (
    <CardNav
      items={items}
      baseColor="#fff"
      menuColor="#000"
      buttonBgColor="#111"
      buttonTextColor="#fff"
      ease="power3.out"
    />
  );
}
