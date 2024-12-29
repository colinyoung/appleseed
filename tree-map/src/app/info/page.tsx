import Link from 'next/link';

export default function Info() {
  return (
    <div className="flex flex-col gap-2 p-8 md:p-20 justify-center items-center">
      <div className="flex flex-col gap-2 md:max-w-[50em] leading-6">
        <Link className="text-sm text-gray-500 no-underline" href="/">
          Back
        </Link>
        <h1 className="text-2xl font-bold mt-6">Info</h1>
        <p>
          This is an interactive map of Chicago where you can request trees anonymously via 311. You
          can right-click to{' '}
          <a href="https://en.wikipedia.org/wiki/Reverse_geocoding">reverse-geocode</a> an address.
          Mobile is not yet supported, nor is batch-requesting, though both are coming soon.
        </p>
        <p>
          While you can request trees yourself via{' '}
          <a href="https://311.chicago.gov">311.chicago.gov</a>, this is a much easier way to
          request: you can search addresses or right-click on the map wherever you want a tree.
        </p>
        <p>
          You shouldn&apos;t expect trees to physically be planted quickly, but generally, they take
          about 2 planting seasons - spring, and fall/winter til the ground freezes. They use a
          single contractor to do this and prefer to do entire streets at once, so requesting trees
          that are missing for a given block is a great way to capitalize on that. The city seems to
          prioritize{' '}
          <a href="https://www.chicago.gov/city/en/depts/cdph/supp_info/Environment/cumulative-impact-assessment.html">
            environmental justice communities
          </a>
          , which is a good thing.
        </p>
        <h2 className="text-xl font-bold mt-4">The process</h2>
        <p>
          Requesting a tree anonymously gives property owners of <em>homes</em> the right to refuse
          a tree, as the city leaves a door hanger with two options: Choose your tree species, or
          call a phone number to decline the tree.
        </p>
        <p>
          My general observation (from following up and checking tree request numbers, Street View,
          or visiting the address) is that some people decline, but the vast majority accept the
          tree.
        </p>
        <p>
          The city seems to plant trees in front of <em>businesses</em> or industrial buildings
          automatically, but on busy streets, there is sometimes a backlog of &quot;conflicts&quot;
          &mdash; utility work, bike lane installations, etc. &mdash; that could delay the planting.
        </p>
        <h2 className="text-xl font-bold mt-4">Why</h2>
        <p>
          The City of Chicago requires new trees for new developments and, infrequently, plant trees
          of their own volition in less forested communities. Other than that, they rely on home-
          and business owners opting-in and requesting a tree. My position is different. I think the
          city should have an opt-out program and plant trees on a grid system, prioritizing less
          forested neighborhoods, until &quot;done&quot;. Until then, using this map (when
          you&apos;re bored or motivated) is a good way to help the city plant more trees.
        </p>
        <h2 className="text-xl font-bold mt-4">FAQs</h2>
        <p>
          <strong>Q:</strong> What about homeowners who don&apos;t want a tree?
          <br />
          <strong>A:</strong> As stated before, they&apos;re given the option to decline.
        </p>
        <p>
          <strong>Q:</strong> What can I say to homeowners to change their mind?
          <br />
          <strong>A:</strong> The city offers{' '}
          <a href="https://www.chicago.gov/city/en/sites/our-roots-chicago/home/media-tools.html">
            flyers about this
          </a>
          .
        </p>
        <p>
          <strong>Q:</strong> Can I plant trees myself?
          <br />
          <strong>A:</strong> No, and besides, the city plants older, larger trees.
        </p>
        <p>
          <strong>Q:</strong> How does the city feel about this site?
          <br />
          <strong>A:</strong> Nobody&apos;s told me to stop (I even told an alderperson about it),
          and the city&apos;s{' '}
          <a href="https://www.chicago.gov/city/en/general/privacy.html">privacy policy</a>{' '}
          doesn&apos;t prevent it. Worst case, this is a great way to crowdsource the process of
          identifying where trees are missing.
        </p>
        <h2 className="text-xl font-bold mt-4">About this site</h2>
        <p>
          This site is open-source, and built with <a href="https://nextjs.org">Next.js</a>,{' '}
          <a href="https://tailwindcss.com">Tailwind</a>, and <a href="https://react.dev">React</a>,
          and uses an API hosted on Heroku. The actual tree planting requests are created with{' '}
          <a href="https://playwright.dev">Playwright</a>.
        </p>
        <p>
          For API access, please write to <a href="mailto:me@colinyoung.com">me@colinyoung.com</a>.
        </p>
      </div>
    </div>
  );
}
