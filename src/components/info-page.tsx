import { ApplyCta } from "@/components/apply-cta";
import { SiteFooter, SiteHeader } from "@/components/site-chrome";
import type { Block, InfoPage } from "@/data/pages";
import type { Inline } from "@/data/site";

function Rich({ nodes }: { nodes: Inline[] }) {
  return (
    <>
      {nodes.map((node, index) =>
        node.kind === "text" ? (
          <span key={index}>{node.text}</span>
        ) : node.href.startsWith("http") &&
          !node.href.startsWith("https://griffinfundingreviews.com") ? (
          <a
            key={index}
            href={node.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            {node.text}
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        ) : (
          <a
            key={index}
            href={node.href.replace("https://griffinfundingreviews.com", "")}
          >
            {node.text}
          </a>
        ),
      )}
    </>
  );
}

function BlockView({ block }: { block: Block }) {
  if (block.kind === "h2") return <h2>{block.text}</h2>;
  if (block.kind === "p")
    return (
      <p>
        <Rich nodes={block.nodes} />
      </p>
    );
  return (
    <ul>
      {block.items.map((item, index) => (
        <li key={index}>
          <Rich nodes={item} />
        </li>
      ))}
    </ul>
  );
}

export function InfoPageView({ page }: { page: InfoPage }) {
  return (
    <>
      <SiteHeader home={false} />
      <main id="main" className="info">
        <div className="wrap info-wrap">
          <p className="eyebrow">
            <span className="eyebrow-mark" aria-hidden="true" />
            Griffin Funding Reviews
          </p>
          <h1>{page.heading}</h1>
          <p className="info-lede">{page.lede}</p>
          <div className="info-body">
            {page.blocks.map((block, index) => (
              <BlockView key={index} block={block} />
            ))}
          </div>
          <p className="info-back">
            <a className="btn btn-primary" href="/">
              See every Griffin Funding rating
            </a>
          </p>
        </div>
      </main>
      <ApplyCta placement={page.id} />
      <SiteFooter home={false} />
    </>
  );
}
