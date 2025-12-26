declare module '*.css';
declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

export type NavItemsTypes = {
    title: string
    href: string
}