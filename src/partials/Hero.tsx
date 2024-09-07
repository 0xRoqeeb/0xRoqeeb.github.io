import {
  GradientText,
  HeroAvatar,
  HeroSocial,
  Section,
} from 'astro-boilerplate-components';

const Hero = () => (
  <Section>
    <HeroAvatar
      title={
        <>
          Hi there, I'm <GradientText>Roqeeb</GradientText> 👋
        </>
      }
      description={
        <>
          Hi there! I'm Roqeeb, a cybersecurity enthusiast with a passion for
          networking, Python, and Bash. I dive deep into the world of ethical
          hacking and security challenges, constantly exploring new techniques
          and tools. On this site, you'll find my{' '}
          <a className="text-cyan-400 hover:underline" href="/posts/">
            writeups
          </a>{' '}
          , tutorials, and insights into the exciting field of cybersecurity.
          Feel free to explore and join me on this journey of discovery and
          learning.{' '}
        </>
      }
      avatar={
        <img
          className="h-80 w-64"
          src="/assets/images/avatarvecnobg.png"
          alt="Avatar image"
          loading="lazy"
        />
      }
      socialButtons={
        <>
          <a
            href="https://x.com/FireEyesOMG"
            target="_blank"
            rel="noopener noreferrer"
          >
            <HeroSocial
              src="/assets/images/twitter-icon.png"
              alt="Twitter icon"
            />
          </a>
          <a
            href="https://tryhackme.com/p/Roqeeb"
            target="_blank"
            rel="noopener noreferrer"
          >
            <HeroSocial src="/assets/images/thm.png" alt="Tryhackme icon" />
          </a>
          <a
            href="https://ng.linkedin.com/in/roqeeb-m-14milimeters?trk=public_post-text"
            target="_blank"
            rel="noopener noreferrer"
          >
            <HeroSocial
              src="/assets/images/linkedin-icon.png"
              alt="Linkedin icon"
            />
          </a>
          <a
            href="https://github.com/0xRoqeeb"
            target="_blank"
            rel="noopener noreferrer"
          >
            <HeroSocial
              src="/assets/images/github-icon-x264.png"
              alt="Github icon"
            />
          </a>

          <a
            href="https://github.com/0xRoqeeb"
            target="_blank"
            rel="noopener noreferrer"
          >
            <HeroSocial src="/assets/images/hackthebox.png" alt="Github icon" />
          </a>
        </>
      }
    />
  </Section>
);

export { Hero };
