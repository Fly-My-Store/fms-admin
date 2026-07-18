'use client';

import NextLink from 'next/link';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import { DownOutlined } from '@ant-design/icons';
import Breadcrumbs from 'components/@extended/Breadcrumbs';
import MainCard from 'components/MainCard';

const QUICK_LINKS = [
  { label: 'Attribute defs', href: '/attribute-defs' },
  { label: 'Categories', href: '/categories' },
  { label: 'Category attrs', href: '/category-attrs' },
  { label: 'Brands', href: '/brands' },
  { label: 'Products', href: '/products' },
  { label: 'Fare', href: '/fare' },
  { label: 'Invoice settings', href: '/invoice-settings' },
  { label: 'Stores', href: '/stores' },
  { label: 'Sellers', href: '/sellers' }
];

const SETUP_STEPS = [
  { step: 1, label: 'Attribute definitions', href: '/attribute-defs' },
  { step: 2, label: 'Categories (root → child)', href: '/categories' },
  { step: 3, label: 'Category attributes (link defs; mark variant axes)', href: '/category-attrs' },
  { step: 4, label: 'Brands', href: '/brands' },
  { step: 5, label: 'Products', href: '/products/create' },
  { step: 6, label: 'Product attributes', href: '/products', note: 'Product detail → attributes' },
  { step: 7, label: 'Variants', href: '/products', note: 'Product detail → add variant' },
  { step: 8, label: 'Variant attributes (axes)', href: '/products', note: 'Variant detail → attributes' },
  { step: 9, label: 'Seller store listing', href: null, note: 'Seller app — price + stock' },
  { step: 10, label: 'Fare / gateway (if needed)', href: '/fare' },
  { step: 11, label: 'Invoice settings', href: '/invoice-settings' }
];

function GuideTable({ headers, rows }) {
  return (
    <Table size="small" sx={{ mt: 1.5, '& td, & th': { borderColor: 'divider' } }}>
      <TableHead>
        <TableRow>
          {headers.map((h) => (
            <TableCell key={h} sx={{ fontWeight: 600 }}>
              {h}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row, i) => (
          <TableRow key={i}>
            {row.map((cell, j) => (
              <TableCell key={j} sx={{ verticalAlign: 'top' }}>
                {cell}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function DontList({ items }) {
  return (
    <Box component="ul" sx={{ m: 0, pl: 2.5, mt: 1 }}>
      {items.map((item) => (
        <Typography key={item} component="li" variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          {item}
        </Typography>
      ))}
    </Box>
  );
}

function Section({ title, defaultExpanded, children }) {
  return (
    <Accordion
      defaultExpanded={defaultExpanded}
      disableGutters
      elevation={0}
      sx={{ border: '1px solid', borderColor: 'divider', '&:before': { display: 'none' }, mb: 1.5, borderRadius: 1, overflow: 'hidden' }}
    >
      <AccordionSummary expandIcon={<DownOutlined style={{ fontSize: 12 }} />}>
        <Typography variant="h5">{title}</Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ pt: 0 }}>{children}</AccordionDetails>
    </Accordion>
  );
}

export default function AdminDataGuideView() {
  return (
    <>
      <MainCard border={false} boxShadow>
        <Stack spacing={2.5}>
          <Box>
            <Typography variant="body1" color="text.secondary">
              Use the same naming, structure, and pricing rules every time so apps, search, and checkout stay consistent. Expand a section when you need detail — start with Golden rules and Things to take care of.
            </Typography>
          </Box>

          <Stack direction="row" flexWrap="wrap" gap={1}>
            {QUICK_LINKS.map((link) => (
              <Button key={link.href} component={NextLink} href={link.href} size="small" variant="outlined" color="secondary">
                {link.label}
              </Button>
            ))}
          </Stack>

          <Section title="Golden rules" defaultExpanded>
            <Alert severity="info" sx={{ mb: 1.5 }}>
              Read these before creating brands, categories, products, or fare rules.
            </Alert>
            <Box component="ol" sx={{ m: 0, pl: 2.5 }}>
              {[
                'Attribute definitions first — never invent attribute codes on a product without creating the def and linking it to the category (or a parent).',
                'Slug is permanent identity — lowercase, no spaces. Prefer underscores for new catalog items (louis_philippe). Forms often auto-fill hyphens — edit before Save if you want underscores.',
                'Display name — Title Case: Louis Philippe (not all lowercase or ALL CAPS).',
                'Record status — use Active for anything customers should see. Inactive/Archived hides from normal browse.',
                'Do not duplicate — search before creating. Brand name+slug, category slug, product slug, variant SKU must be unique.',
                'Sellers list products — admin builds catalog; sellers add store listings (price + stock). Admin MRP alone does not sell.',
                'Fare must exist — keep active default category fare bands and gateway bands covering ₹0 upward, or checkout fails with NO_FARE_RULE.',
                'Screen Guard is special — live root slug is screen-guard (hyphens). Do not rename. Only direct children of that root count as Screen Guard for fare, seller catalog, and riders.'
              ].map((rule) => (
                <Typography key={rule} component="li" variant="body2" sx={{ mb: 1 }}>
                  {rule}
                </Typography>
              ))}
            </Box>
          </Section>

          <Section title="Things to take care of" defaultExpanded>
            <Alert severity="warning" sx={{ mb: 1.5 }}>
              Use this when something looks fine in admin but fails in the app or at checkout.
            </Alert>
            <GuideTable
              headers={['Area', 'Take care']}
              rows={[
                ['Visibility', 'Product, variant, brand, category, images, and store listing must all be Active.'],
                ['Sellable price', 'Customer pays store listing price, not admin variant MRP / sale price.'],
                ['Stock', 'Listing without stock (or Inactive listing) will not sell.'],
                ['Attribute chain', 'Def → linked on category (or ancestor) → filled on product and/or variant. Axis values go on variants.'],
                ['Max 3 axes', 'System blocks a 4th variant axis. Plan Color / Storage / Model carefully.'],
                ['Allowed values', 'If the def has an allowed list, values must match exactly or save fails.'],
                ['Images', 'JPEG / PNG / WebP / GIF only (HEIC, SVG fail). Prefer ~512×512 logos. Set one primary image.'],
                ['Fare bands', 'Half-open: min ≤ cart < max. No gaps from ₹0. No overlapping active bands.'],
                ['Fare “active”', 'Rule needs Active record status and is_active on. Prefer new band + deactivate old.'],
                ['GST on fees', 'Amounts are GST-inclusive. GST % only splits tax inside the fee — does not add on top.'],
                ['Mixed cart', 'Platform & delivery across groups: MAX. Seller platform %: SUM. Service fee: sum of fee × qty.'],
                ['Non-SG category fares', 'Mostly affect service fee. Platform/delivery groups are Default vs Screen Guard — not every category.'],
                ['SG sellers', 'Store/seller needs can_sell_screen_guard or they will not see SG catalog.'],
                ['SG riders', 'SG orders need a screen-guard-capable rider or assignment can fail.'],
                ['SG tree depth', 'Put device/type as direct children of screen-guard. Grandchildren are not treated as SG.']
              ]}
            />
          </Section>

          <Section title="Naming cheat sheet">
            <GuideTable
              headers={['Field', 'Rule', 'Example']}
              rows={[
                ['Name', 'Title Case', 'Louis Philippe'],
                ['Slug (new catalog)', 'lowercase + underscores', 'louis_philippe'],
                ['Screen Guard root', 'Live slug — do not change', 'screen-guard'],
                ['SG child name', 'Parent Child (title case)', 'Screen Guard Tempered'],
                ['Attribute code', 'lowercase snake_case', 'storage_gb, color_name'],
                ['SKU', 'UPPERCASE segments, unique', 'LP-BLU-128'],
                ['Sort letter (brands)', 'Single A–Z / 0–9 / #', 'L for Louis Philippe']
              ]}
            />
            <Typography variant="subtitle2" sx={{ mt: 2, mb: 0.5 }}>
              Uniqueness
            </Typography>
            <DontList
              items={[
                'Brand: name and slug unique.',
                'Category: slug unique (names can collide — still avoid confusing duplicates).',
                'Product: slug unique.',
                'Variant: SKU unique; barcode unique if set.',
                'Attribute code: primary key — immutable after create.'
              ]}
            />
          </Section>

          <Section title="Setup order (always follow this)">
            <Alert severity="warning" sx={{ mb: 1.5 }}>
              Do not use Attribute groups or PLP configs for new production work (marked out of scope).
            </Alert>
            <Stack spacing={1}>
              {SETUP_STEPS.map((s) => (
                <Stack key={s.step} direction="row" alignItems="center" spacing={1.5} flexWrap="wrap">
                  <Chip label={s.step} size="small" color="primary" sx={{ minWidth: 32 }} />
                  {s.href ? (
                    <Typography
                      component={NextLink}
                      href={s.href}
                      variant="body2"
                      sx={{ color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
                    >
                      {s.label}
                    </Typography>
                  ) : (
                    <Typography variant="body2">{s.label}</Typography>
                  )}
                  {s.note && (
                    <Typography variant="caption" color="text.secondary">
                      {s.note}
                    </Typography>
                  )}
                </Stack>
              ))}
            </Stack>
            <Box
              sx={{
                mt: 2,
                p: 2,
                bgcolor: 'grey.50',
                borderRadius: 1,
                fontFamily: 'monospace',
                fontSize: 13,
                lineHeight: 1.7,
                whiteSpace: 'pre-wrap',
                color: 'text.secondary'
              }}
            >
              {`Attribute defs
      ↓
Category + Category attrs (axes)
      ↓
Brand
      ↓
Product  →  Product attributes
      ↓
Variant  →  Variant attributes (axes)
      ↓
Seller: Store listing (price + stock)`}
            </Box>
          </Section>

          <Section title="1. Attribute definitions">
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Create these before categories are fully wired and before products.{' '}
              <Typography component={NextLink} href="/attribute-defs" variant="body2" sx={{ color: 'primary.main' }}>
                Open Attribute defs
              </Typography>
            </Typography>
            <GuideTable
              headers={['Field', 'Rule']}
              rows={[
                ['Code', 'Permanent. a-z, 0-9, _, ., - only. Cannot change after create.'],
                ['Name', 'Human label: Color, Storage (GB)'],
                ['Data type', 'Prefer text / int / decimal / bool / json'],
                ['Unit', 'Optional: GB, mm, mAh'],
                ['Allowed values', 'Optional. If set, product/variant values must match exactly'],
                ['Status', 'Active']
              ]}
            />
            <Typography variant="subtitle2" sx={{ mt: 2, mb: 0.5 }}>
              Take care
            </Typography>
            <DontList
              items={[
                'Decide codes once — typos become permanent (color vs colour).',
                'Keep units consistent (storage_gb, not sometimes storage).',
                'For pickers, either use allowed values or free text — mixed discipline causes save errors later.'
              ]}
            />
            <Typography variant="subtitle2" sx={{ mt: 2, mb: 0.5 }}>
              What not to do
            </Typography>
            <DontList
              items={[
                'Do not create Color and colour as two codes.',
                'Do not put spaces in codes.',
                'Do not delete a def that products already use.',
                'Do not change data type after products have values.'
              ]}
            />
          </Section>

          <Section title="2. Brands">
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              <Typography component={NextLink} href="/brands" variant="body2" sx={{ color: 'primary.main' }}>
                Open Brands
              </Typography>
            </Typography>
            <GuideTable
              headers={['Field', 'Rule']}
              rows={[
                ['Name', 'Title Case: Louis Philippe'],
                ['Slug', 'louis_philippe (edit if auto-slug used hyphens)'],
                ['Sort letter', 'Usually first letter of name (L)'],
                ['Description', 'Clear spelling; no spam keywords'],
                ['Logo', 'Prefer 512 × 512, PNG or WebP, square'],
                ['Status', 'Active']
              ]}
            />
            <Typography variant="subtitle2" sx={{ mt: 2, mb: 0.5 }}>
              Take care
            </Typography>
            <DontList
              items={[
                'Inactive brand hides products that depend on it in customer browse.',
                'Logo must be JPEG / PNG / WebP / GIF.'
              ]}
            />
            <Typography variant="subtitle2" sx={{ mt: 2, mb: 0.5 }}>
              What not to do
            </Typography>
            <DontList
              items={[
                'Do not upload a stretched or tiny logo and “fix later.”',
                'Do not reuse another brand’s slug or name.',
                'Do not leave name in ALL CAPS unless that is the real trademark style.'
              ]}
            />
          </Section>

          <Section title="3. Categories & Screen Guard">
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              <Typography component={NextLink} href="/categories" variant="body2" sx={{ color: 'primary.main' }}>
                Open Categories
              </Typography>
            </Typography>
            <Typography variant="subtitle2" sx={{ mt: 1 }}>
              Root category
            </Typography>
            <GuideTable
              headers={['Field', 'Rule']}
              rows={[
                ['Name', 'Title Case: Screen Guard'],
                ['Slug', 'Screen Guard root must stay screen-guard. Other roots: prefer lower_underscore'],
                ['Parent', 'None'],
                ['Level', '0 (Root)'],
                ['Status', 'Active']
              ]}
            />
            <Typography variant="subtitle2" sx={{ mt: 2 }}>
              Child category
            </Typography>
            <GuideTable
              headers={['Field', 'Rule']}
              rows={[
                ['Name', 'Parent Child — e.g. Screen Guard Tempered'],
                ['Slug', 'Unique; e.g. screen-guard-tempered'],
                ['Parent', 'Select the parent category'],
                ['Level', '1 (Sub) for direct children'],
                ['Status', 'Active']
              ]}
            />
            <Alert severity="error" sx={{ mt: 2 }}>
              <strong>Screen Guard (critical):</strong> live root slug is <code>screen-guard</code> — do not rename. Put device/type trees as <strong>direct children</strong> only. Grandchildren are generally not treated as Screen Guard for fare, seller visibility, or rider matching.
            </Alert>
            <Typography variant="subtitle2" sx={{ mt: 2, mb: 0.5 }}>
              What not to do
            </Typography>
            <DontList
              items={[
                'Do not create orphan children with no parent when they belong under a root.',
                'Do not set Level 0 on a category that has a parent.',
                'Do not create overlapping names that confuse sellers.',
                'Do not put Screen Guard products under a non-SG category for convenience.'
              ]}
            />
          </Section>

          <Section title="4. Category attributes / axes">
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Links attribute defs to a category and decides PLP filters and variant pickers.{' '}
              <Typography component={NextLink} href="/category-attrs" variant="body2" sx={{ color: 'primary.main' }}>
                Open Category attrs
              </Typography>
            </Typography>
            <GuideTable
              headers={['Field', 'Meaning']}
              rows={[
                ['Category', 'Attrs apply here; children inherit axes from parents'],
                ['Attribute code', 'Must already exist in Attribute defs'],
                ['Required', 'Must be filled when used'],
                ['Variant axis', 'Shopper chooses this to pick a variant (Color, Storage, …)'],
                ['Filterable / Searchable', 'Browse/search behaviour']
              ]}
            />
            <Typography variant="subtitle2" sx={{ mt: 2 }}>
              Axis rules
            </Typography>
            <DontList
              items={[
                'Maximum 3 variant axes per category (hard limit).',
                'Set axes before adding many variants.',
                'Product/variant attribute codes must be allowed on the product’s category or an ancestor.'
              ]}
            />
            <Typography variant="subtitle2" sx={{ mt: 2, mb: 0.5 }}>
              What not to do
            </Typography>
            <DontList
              items={[
                'Do not mark more than 3 axes.',
                'Do not mark every attribute as an axis (only true choice dimensions).',
                'Do not add variant attributes for codes not linked to the category chain.',
                'Do not change axes after hundreds of variants without a cleanup plan.'
              ]}
            />
          </Section>

          <Section title="5. Products & variants">
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              <Typography component={NextLink} href="/products" variant="body2" sx={{ color: 'primary.main' }}>
                Open Products
              </Typography>
            </Typography>
            <GuideTable
              headers={['Field', 'Rule']}
              rows={[
                ['Name', 'Title Case product name'],
                ['Slug', 'lowercase + underscores (edit auto-hyphen if needed)'],
                ['Brand', 'Select existing Active brand'],
                ['Category', 'Most specific category (prefer child over root)'],
                ['Description', 'Accurate; no fake claims'],
                ['Images', 'JPEG/PNG/WebP/GIF; set one primary'],
                ['Status', 'Active when ready to sell']
              ]}
            />
            <Typography variant="subtitle2" sx={{ mt: 2 }}>
              Then on product detail
            </Typography>
            <DontList
              items={[
                'Product attributes — specs the same for all variants.',
                'Add variant(s) — each sellable SKU.',
                'Open each variant → Variant attributes — especially axis values.'
              ]}
            />
            <Typography variant="subtitle2" sx={{ mt: 2 }}>
              Variants
            </Typography>
            <GuideTable
              headers={['Field', 'Rule']}
              rows={[
                ['SKU', 'Unique across the whole catalog'],
                ['MRP / Sale price', 'Catalog anchors only — store listing price is what customers pay'],
                ['Barcode / GTIN', 'Optional; unique if set'],
                ['Status', 'Active'],
                ['Tax', 'Catalog is tax-inclusive; per-variant GST % is not fully live yet']
              ]}
            />
            <Typography variant="subtitle2" sx={{ mt: 2, mb: 0.5 }}>
              What not to do
            </Typography>
            <DontList
              items={[
                'Do not create a product with no category/brand “to fill later” if it will go live.',
                'Do not put axis values only in the description — use variant attributes.',
                'Do not create duplicate products for each color; use one product + many variants.',
                'Do not leave the product Active while all variants are Inactive.',
                'Do not reuse SKUs or leave axis attributes empty.',
                'Do not expect admin-only MRP to sell the item — seller must list it.'
              ]}
            />
          </Section>

          <Section title="6. How category “axis” works">
            <Box component="ol" sx={{ m: 0, pl: 2.5 }}>
              {[
                'Define attributes once (color_name, storage_gb, …).',
                'Attach them to a category and tick Variant axis for the ones shoppers choose.',
                'Each variant gets concrete values for those axes.',
                'The app builds the picker from those axes (e.g. Color × Storage).',
                'Child categories can reuse parent axes so you do not re-link everything.'
              ].map((t) => (
                <Typography key={t} component="li" variant="body2" sx={{ mb: 0.75 }}>
                  {t}
                </Typography>
              ))}
            </Box>
            <Alert severity="warning" sx={{ mt: 1.5 }}>
              If axes are wrong, filters and “choose options” screens break even if names look fine.
            </Alert>
          </Section>

          <Section title="7. Seller listing & Screen Guard selling">
            <Alert severity="info" sx={{ mb: 1.5 }}>
              Admin catalog ≠ buyable inventory. Customers need a store listing with price + stock.
            </Alert>
            <GuideTable
              headers={['Step', 'Who', 'What']}
              rows={[
                ['Catalog', 'Admin', 'Brand, category, product, variants, attrs, images'],
                ['Listing', 'Seller (app)', 'Store + variant → price + stock + listing Active'],
                ['SG permission', 'Admin on store/seller', 'Enable can_sell_screen_guard for Screen Guard sellers']
              ]}
            />
            <Typography variant="subtitle2" sx={{ mt: 2, mb: 0.5 }}>
              Take care
            </Typography>
            <DontList
              items={[
                'After creating a new variant, the seller must list that SKU — old listings do not auto-cover new variants.',
                'Screen Guard orders need riders flagged for screen-guard work, or assignment can fail (NO_SCREEN_GUARD_RIDER).',
                'Check Stores / Sellers for the can_sell_screen_guard flag when SG catalog is missing in the seller app.'
              ]}
            />
          </Section>

          <Section title="8. Fare and pricing">
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Checkout adds platform fee, delivery, optional service/install fee, km surcharge, and payment gateway share — not only item price.{' '}
              <Typography component={NextLink} href="/fare" variant="body2" sx={{ color: 'primary.main' }}>
                Open Fare
              </Typography>
            </Typography>
            <GuideTable
              headers={['Type', 'What it controls']}
              rows={[
                ['Category fare', 'Platform fee, delivery, service fee, km slabs, seller %. Default (no category) or one category.'],
                ['Gateway fare', 'Payment gateway % by cart value band. Also required — missing gateway → NO_FARE_RULE.']
              ]}
            />
            <Typography variant="subtitle2" sx={{ mt: 2 }}>
              Order value bands
            </Typography>
            <DontList
              items={[
                'Half-open range: min ≤ amount < max (₹ in UI; stored as paisa).',
                'No overlapping active bands for the same category (or two defaults), or for gateway.',
                'No gaps from ₹0 — a ₹50 cart with first band starting at ₹100 fails.',
                'Prefer new band + deactivate old (or Clone then edit).'
              ]}
            />
            <Typography variant="subtitle2" sx={{ mt: 2 }}>
              Default vs Screen Guard vs other categories
            </Typography>
            <DontList
              items={[
                'Default (category empty): used for most non-SG products’ platform/delivery group, and as fallback.',
                'Screen Guard items form their own fare group. Keep SG fare rows if fees differ; missing SG can fall back to default.',
                'Other category-specific fares mainly drive service/install fee (parent → default fallback). They do not each get a separate platform/delivery group like SG.',
                'An explicit ₹0 service fee is kept — it does not keep falling back to parents.'
              ]}
            />
            <Typography variant="subtitle2" sx={{ mt: 2 }}>
              Mixed cart
            </Typography>
            <DontList
              items={[
                'Customer platform fee & delivery across groups: take the higher (MAX).',
                'Seller platform %: SUM of each group’s (subtotal × %).',
                'Service / install: sum of (fee × qty) per matching rules.'
              ]}
            />
            <Typography variant="subtitle2" sx={{ mt: 2 }}>
              Who pays what
            </Typography>
            <GuideTable
              headers={['Charge', 'Who']}
              rows={[
                ['Item price', 'Customer → store/seller'],
                ['Customer platform fee', 'Customer → platform'],
                ['Customer delivery', 'Customer → delivery side'],
                ['Service / install fee (× qty)', 'Customer → typically rider'],
                ['Km surcharge', 'Customer (distance slabs; first km may be free)'],
                ['Gateway %', 'Split per rules (customer and/or seller)'],
                ['Seller platform %', 'Deducted from seller'],
                ['Seller delivery amount', 'Deducted from seller per rules']
              ]}
            />
            <Alert severity="info" sx={{ mt: 2 }}>
              GST on fare is GST-inclusive. The GST % splits tax inside the fee; it does not add extra on top. For gateway, enter the inclusive recovery % you want covered (often ~ gateway fee + GST).
            </Alert>
            <Typography variant="body2" sx={{ mt: 1.5 }}>
              Platform invoice settings (
              <Typography component={NextLink} href="/invoice-settings" variant="body2" sx={{ color: 'primary.main' }}>
                /invoice-settings
              </Typography>
              ) are for platform fee invoices — not product item GST.
            </Typography>
            <Typography variant="subtitle2" sx={{ mt: 2, mb: 0.5 }}>
              What not to do (fare)
            </Typography>
            <DontList
              items={[
                'Do not leave no active default covering low carts — NO_FARE_RULE.',
                'Do not leave no active gateway bands — same error.',
                'Do not create overlapping active bands.',
                'Do not treat GST % as “add 18% on top” of an inclusive fee.',
                'Do not assume a non-SG category fare changes platform fee the way SG does.'
              ]}
            />
          </Section>

          <Section title="9. Images & uploads">
            <GuideTable
              headers={['Rule', 'Detail']}
              rows={[
                ['Allowed types', 'JPEG, PNG, WebP, GIF only'],
                ['Size', 'Up to 100MB per catalog image (keep logos/product shots reasonable)'],
                ['Count', 'Multi-upload up to 10 files per request'],
                ['Primary', 'Set one primary image per product/variant when selling'],
                ['Avoid', 'HEIC (iPhone default), SVG, PDF as product images — they fail server-side']
              ]}
            />
          </Section>

          <Section title="10. Record status">
            <GuideTable
              headers={['Status', 'Use when', 'App effect']}
              rows={[
                ['Active', 'Live in apps', 'Visible / usable in customer browse & cart'],
                ['Inactive', 'Temporarily hidden', 'Hidden from normal apps; keep data'],
                ['Archived', 'Soft-retired', 'Prefer this over deleting']
              ]}
            />
            <DontList
              items={[
                'Fare also needs is_active on (not only Active status).',
                'Store listings have a separate Active/Inactive listing status.'
              ]}
            />
          </Section>

          <Section title="11. Common problems → what to check">
            <GuideTable
              headers={['Symptom', 'Check']}
              rows={[
                ['Product not in customer app', 'Product / variant / brand / category / images all Active? Correct category?'],
                ['Can’t buy / no price', 'Store listing exists? Listing Active? Stock > 0? This exact variant listed?'],
                ['Checkout NO_FARE_RULE', 'Default category fare + gateway cover this cart value? Both Active + is_active?'],
                ['Options picker empty / wrong', '≤3 axes on category? Axis attrs filled on each variant? Codes linked on category chain?'],
                ['Attribute save rejected', 'Allowed values? Code linked to category? Wrong data type?'],
                ['Image upload fails', 'HEIC/SVG? File too large?'],
                ['Seller can’t see Screen Guard', 'can_sell_screen_guard on? Categories under screen-guard root?'],
                ['Rider not assignable for SG', 'Rider flagged for screen-guard capability?'],
                ['Duplicate create error', 'Search existing slug / SKU / brand name before retry']
              ]}
            />
          </Section>

          <Section title="12. Quick checklist before Save">
            <Typography variant="subtitle2">Brand</Typography>
            <DontList items={['Name Title Case', 'Unique slug', 'Sort letter correct', 'Logo ~512×512, allowed format', 'Status Active']} />
            <Typography variant="subtitle2" sx={{ mt: 1.5 }}>
              Category
            </Typography>
            <DontList
              items={[
                'Name Title Case (child = Parent Child)',
                'Unique slug (SG root stays screen-guard)',
                'Parent + Level correct (SG children = direct under root)',
                'Category attrs / axes set (≤ 3 axes)'
              ]}
            />
            <Typography variant="subtitle2" sx={{ mt: 1.5 }}>
              Product
            </Typography>
            <DontList
              items={[
                'Brand + category set and Active',
                'Product attrs added where needed',
                'At least one Active variant with axis attrs filled',
                'Primary image set',
                'Seller will list on store (price + stock)',
                'If SG: seller has can_sell_screen_guard'
              ]}
            />
            <Typography variant="subtitle2" sx={{ mt: 1.5 }}>
              Fare
            </Typography>
            <DontList items={['Default bands cover ₹0+ with no gaps/overlaps', 'Gateway bands exist similarly', 'SG fare present if SG fees differ', 'GST treated as inclusive']} />
          </Section>

          <Section title="13. When to call engineering">
            <DontList
              items={[
                'Renaming or deleting live slug screen-guard',
                'Changing how fare inheritance or mixed-cart max/sum works',
                'Needing more than 3 variant axes',
                'Item-level GST per variant (planned separately)',
                'Bulk import of catalog',
                'Changing Screen Guard membership rules (e.g. deep grandchildren)'
              ]}
            />
          </Section>

          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            Follow this guide for every new brand, category, and product. Consistency keeps customer, seller, and rider apps working together.
          </Typography>
        </Stack>
      </MainCard>
    </>
  );
}
