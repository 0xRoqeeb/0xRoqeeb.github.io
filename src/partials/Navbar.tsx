import {
  Logo,
  NavbarTwoColumns,
  NavMenu,
  NavMenuItem,
  Section,
} from 'astro-boilerplate-components';

const Navbar = () => (
  <Section>
    <NavbarTwoColumns>
      <a href="/">
        <Logo
          icon={
            <svg
              className="mr-1 size-10 stroke-cyan-600"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M0 0h24v24H0z" stroke="none"></path>
              <rect x="3" y="12" width="6" height="8" rx="1"></rect>
              <rect x="9" y="8" width="6" height="12" rx="1"></rect>
              <rect x="15" y="4" width="6" height="16" rx="1"></rect>
              <path d="M4 20h14"></path>
            </svg>
          }
          name="Roqeeb's Blog"
        />
      </a>

      <div className="flex items-center gap-3">
        <NavMenu>
          <NavMenuItem href="/posts/">Blogs</NavMenuItem>
          <NavMenuItem href="/posts/">Writeups</NavMenuItem>

          <NavMenuItem href="https://x.com/FireEyesOMG" target="_blank">
            Twitter
          </NavMenuItem>

          <NavMenuItem href="https://github.com/0xRoqeeb" target="_blank">
            Github
          </NavMenuItem>
        </NavMenu>

        <button
          id="search-trigger"
          aria-label="Search"
          className="rounded-md p-2 text-gray-400 transition-colors hover:bg-slate-700 hover:text-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="size-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
            />
          </svg>
        </button>
      </div>
    </NavbarTwoColumns>
  </Section>
);

export { Navbar };
