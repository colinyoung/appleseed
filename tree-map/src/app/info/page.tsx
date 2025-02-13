import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Info',
};

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
          can right-click on good tree locations to{' '}
          <a href="https://en.wikipedia.org/wiki/Reverse_geocoding">reverse-geocode</a> an address
          and request a tree/trees. You can make one request at a time, though batch-requesting is
          coming soon. (It doesn&apos;t hurt that this rate-limits things for now).
        </p>
        <h2 className="text-xl font-bold mt-4">Planting a tree</h2>
        <p>
          Right-click where the tree should go (
          <a href="#machine-learning">the more precisely, the better</a>). Two pins will be dropped:
          One marking the spot, and another marking the property. (Sometimes they don&apos;t quite
          match - in that case, just click on the building.)
        </p>
        <h2 id="examples" className="text-xl font-bold mt-4">
          Examples
        </h2>
        <p>
          Good tree locations are where the parkway is wide enough, not a driveway or bus stop, and
          visibly clear with no tree (small, freshly planted ones can be hard to spot).
        </p>
        <details className="mb-2">
          <summary className="cursor-pointer hover:text-gray-600">✅ Good tree locations</summary>
          <figure className="mt-2 inline-block">
            <Image
              src="/assets/locations.png"
              alt="Indicating where a user should click to request a tree"
              width={364}
              height={440}
            />
            <figcaption className="text-sm text-gray-500 text-bold text-center p-2 inline-block">
              Good locations are grass parkways or sidewalks (wide enough, about as wide as a car).
            </figcaption>
          </figure>
        </details>
        <details className="mb-2">
          <summary className="cursor-pointer hover:text-gray-600">❌ Bad tree locations</summary>
          <figure className="mt-2 inline-block">
            <Image
              src="/assets/donot.png"
              alt="Indicating where a user should NOT request a tree"
              width={364}
              height={440}
            />
            <figcaption className="text-sm text-gray-500 text-bold text-center p-2 inline-block">
              Bad locations are driveways, bus stops, or sidewalks that are too narrow.
            </figcaption>
          </figure>
        </details>
        <h2 className="text-xl font-bold mt-4">Requesting trees</h2>
        <p>
          While you can request trees yourself via{' '}
          <a href="https://311.chicago.gov">311.chicago.gov</a>, this is a much easier way to
          request: you can search addresses or right-click on the map wherever you want a tree ( the{' '}
          <a href="#machine-learning">suggested method</a>).
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
          a tree, as the city leaves a door hanger alerting them and allowing them to decline.
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
          The City of Chicago requires new trees for new developments (but trees often don&apos;t
          get planted anyway) and, infrequently, plants trees of their own volition in less forested
          communities. Other than that, they rely on home- and business owners opting-in and
          requesting a tree. My position is different. I think the city should have an opt-out
          program and plant trees on a grid system, prioritizing less forested neighborhoods, until
          &quot;done&quot;. Until then, using this map (when you&apos;re bored or motivated) is a
          good way to help the city plant more trees. At the very least, it builds a database of
          viable tree locations.
        </p>
        <h2 id="machine-learning" className="text-xl font-bold mt-4">
          Machine learning
        </h2>
        <p>
          Right-clicks will store requests annotated with the precise location of the click. In the
          future, this may be used to train a future machine learning vision model (which will be
          open-sourced) to identify good locations for trees, potentially to be used citywide or
          even in other cities. By using this site, you consent to that.
        </p>
        <h2 className="text-xl font-bold mt-4">FAQs</h2>
        <p>
          <strong>Q:</strong> What about homeowners who don&apos;t want a tree?
          <br />
          <strong>A:</strong> As stated before, they&apos;re given the option to decline.
        </p>
        <p>
          <strong>Q:</strong> Can I plant trees myself?
          <br />
          <strong>A:</strong> No, and besides, the city plants older, larger trees.
        </p>
        <p>
          <strong>Q:</strong> How does the city feel about this site?
          <br />
          <strong>A:</strong> The city&apos;s{' '}
          <a href="https://www.chicago.gov/city/en/general/privacy.html">privacy policy</a>{' '}
          doesn&apos;t prohibit this, and nobody&apos;s told me to stop (I even told an alderperson
          about it). Worst case, this is a great way to crowdsource the process of identifying where
          trees are missing.
        </p>
        <p>
          <strong>Q:</strong> What about tree roots damaging pipes or other concerns?
          <br />
          <strong>A:</strong> The city has a{' '}
          <a href="https://www.chicago.gov/city/en/sites/our-roots-chicago/home/media-tools.html">
            media kit
          </a>{' '}
          about this that answers this and other questions.
        </p>
        <p>
          <strong>Q:</strong> I don&apos;t want a tree. Can I make your site not let people request
          trees in my parkway?
          <br />
          <strong>A:</strong> Sure, just email me at{' '}
          <a href="mailto:me@colinyoung.com">me@colinyoung.com</a> and I&apos;ll add an exception
          for you.
        </p>
        <h2 className="text-xl font-bold mt-4">About this site</h2>
        <p>
          This site is open-source, and built with <a href="https://nextjs.org">Next.js</a>,{' '}
          <a href="https://tailwindcss.com">Tailwind</a>, and <a href="https://react.dev">React</a>,
          and uses an API hosted on Heroku. The actual tree planting requests are created with{' '}
          <a href="https://playwright.dev">Playwright</a>.
        </p>
        <p>
          Please do not abuse this system. You can write to me at{' '}
          <a href="mailto:me@colinyoung.com">me@colinyoung.com</a> or contact me on{' '}
          <a href="https://bsky.app/profile/colinyoung.com">Bluesky</a>. Source code is available{' '}
          <a href="https://github.com/colinyoung/appleseed">here</a>.
        </p>
        <hr />
        <p>
          Shovel by Dwi Budiyanto from{' '}
          <a
            href="https://thenounproject.com/browse/icons/term/shovel/"
            target="_blank"
            title="Shovel Icons"
          >
            Noun Project
          </a>{' '}
          (CC BY 3.0)
        </p>
      </div>
    </div>
  );
}
