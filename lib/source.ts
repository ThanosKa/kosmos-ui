import { loader } from 'fumadocs-core/source';
import { lucideIconsPlugin } from 'fumadocs-core/source/lucide-icons';
import { docsContentRoute, docsImageRoute, docsRoute } from './shared';
import { defineDocs } from 'fumadocs-mdx/macro';
import { metaSchema, pageSchema } from 'fumadocs-core/source/schema';
import { z } from 'zod';

const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    // `date` is required on changelog entries (checked in lib/changelog.ts) and unused elsewhere.
    // `baseUi` is the Base UI page of the primitive a component page wraps, linked under its description.
    // `baseUiName` names that primitive when the page URL doesn't (Segmented control wraps Radio Group at `/radio`).
    schema: pageSchema.extend({ date: z.coerce.date().optional(), baseUi: z.url().optional(), baseUiName: z.string().optional() }),
    postprocess: {
      // Docs components render through lib/llms.ts placeholders, so llms.txt gets code, not JSX.
      includeProcessedMarkdown: {
        mdxAsPlaceholder: [
          'ComponentPreview',
          'ComponentInstall',
          'ComponentSource',
          'ShadcnCommand',
          'RegistryConfig',
          'RegistryCss',
          'ChangelogEntries',
          'DocsIndex',
          'Steps',
          'Step',
          'ColorTokens',
          'TypeRoles',
          'ShadowSurfaces',
          'RadiusScale',
          'MotionTokens',
          'EasingCurves',
          'PackageInstall',
          'LinkCards',
          'LinkCard',
        ],
      },
    },
  },
  meta: {
    schema: metaSchema,
  },
});

// See https://fumadocs.dev/docs/headless/source-api for more info
export const source = loader({
  baseUrl: docsRoute,
  source: docs.toFumadocsSource(),
  plugins: [lucideIconsPlugin()],
});
