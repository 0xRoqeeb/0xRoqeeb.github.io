import {
  GradientText,
  Newsletter,
  Section,
} from 'astro-boilerplate-components';

const CTA = () => (
  <Section>
    <Newsletter
      title={
        <>
          Subscribe to my <GradientText>Newsletters</GradientText>
        </>
      }
      description="Join my newsletter to stay updated on the latest in cybersecurity, tips, and write-ups. Get exclusive insights straight to your inbox!."
    />
  </Section>
);

export { CTA };
