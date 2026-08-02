=== Hacé Cuentas — Calculadoras ===
Contributors: rambiss
Tags: calculator, embed, shortcode, finance, block
Requires at least: 6.5
Tested up to: 7.0
Requires PHP: 7.2
Stable tag: 1.1.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Embed interactive calculators (salary, taxes, BMI, loans, VAT and hundreds more) into your posts and pages with a block or a shortcode.

== Description ==

**Hacé Cuentas — Calculadoras** lets you embed hundreds of calculator hubs from [hacecuentas.com](https://hacecuentas.com) directly into your WordPress site, without touching code. The tools cover Argentina, Latin America, Spain, Brazil, Portugal and English-speaking markets across finance, taxes, payroll, health and everyday math.

It is ideal for accounting firms, personal-finance blogs, HR consultancies, real-estate sites, health/fitness sites and media outlets: you add an interactive tool your readers use **without leaving your page**.

= Features =

* **Gutenberg block** with one-click buttons for the most-used calculators, a searchable catalog, and a live preview inside the editor.
* **Shortcode** `[hacecuentas slug="impuestos/monotributo"]` for the classic editor or widgets. Shortcodes saved with old calculator slugs keep working through permanent redirects.
* **Auto-embed by URL**: paste a calculator link in the block editor and it turns into an embed automatically (via oEmbed).
* **Responsive**: the embed adapts to your content width and adjusts its height automatically.
* **Optional source link**: if you want, you can enable a credit link back to Hacé Cuentas below the calculator. Off by default — you decide.
* **Private and lightweight**: no signup or tracking is required, and the plugin does not load heavy libraries on your site.
* **Free and no signup.**

= Some popular calculators =

* Take-home salary (Argentina)
* Monotributo 2026
* Aguinaldo (SAC / 13th salary)
* Severance pay
* Loans and installments
* Compound interest and fixed-term deposits
* BMI, calories (TDEE), pregnancy
* VAT, percentages, rule of three
* Unit and currency converters

== External services ==

This plugin connects to **hacecuentas.com**, a service operated by the plugin author, to display the calculators. It relies on it in two ways:

1. **Calculator catalog API** — `https://hacecuentas.com/api/embed-calcs.json`
   The plugin requests this public JSON (server-side, from your WordPress install) to map a calculator slug to its human-readable title, so the block picker and the optional credit link show the real calculator name. The request is made the first time a calculator is rendered and the result is cached for 12 hours. **No user or visitor data is sent** — it is a plain read of the public catalog.

2. **Calculator hub embed** — `https://hacecuentas.com/<hub-path>?hc_embed=1`
   When a calculator is shown, the visitor's browser loads an iframe from hacecuentas.com. The iframe isolates the interactive part of the same canonical hub used on Hacé Cuentas, so formulas and current data do not diverge. The plugin does not create an account. Standard Hacé Cuentas analytics and consent rules may apply inside the iframe; values entered into calculator fields are not stored by this plugin.

By using this plugin you rely on the hacecuentas.com service. Please review its terms and privacy policy:

* Terms of use: https://hacecuentas.com/terminos
* Privacy policy: https://hacecuentas.com/privacidad

== Installation ==

1. In your WordPress dashboard, go to **Plugins → Add New** and search for "Hacé Cuentas".
2. Install and activate the plugin.
3. In any post or page, add the **"Calculadora Hacé Cuentas"** block and choose the calculator you want to show.

= With a shortcode =

Paste this into your content (classic editor, text widgets, etc.):

`[hacecuentas slug="impuestos/monotributo"]`

You can set the initial height:

`[hacecuentas slug="salud/peso-ideal-imc" height="700"]`

The `slug` accepts the path after `hacecuentas.com`. For example, for `https://hacecuentas.com/salud/peso-ideal-imc` use `salud/peso-ideal-imc`. Full Hacé Cuentas URLs and old calculator slugs are also accepted for backwards compatibility.

= Auto-embed by pasting the URL =

In the block editor, paste the full URL of a calculator hub (for example `https://hacecuentas.com/trabajo/sueldo-bruto-y-neto`) on its own line and WordPress turns it into an embed automatically.

== Frequently Asked Questions ==

= Is it free? =

Yes. The plugin and the calculators are 100% free and require no signup.

= Does it load heavy scripts on my site? =

No. The calculator is shown inside a lightweight iframe. The only script the plugin adds to your page is a small height-adjustment helper (a few KB).

= Is any visitor data sent anywhere? =

The plugin itself does not store calculator inputs or create accounts. The iframe is served by hacecuentas.com and follows its privacy, analytics and consent rules. See "External services" for details.

= Does the plugin add links to my site without permission? =

No. By default only the calculator is shown. If you want, you can enable a credit link back to Hacé Cuentas below the calculator (the "Link to source" option in the block, or `credit="yes"` in the shortcode). It is off by default.

= How do I find a calculator's slug? =

Use the path after the domain. In `https://hacecuentas.com/trabajo/aguinaldo`, the value is `trabajo/aguinaldo`. The Gutenberg block includes a searchable catalog, and old single-slug calculator URLs remain compatible.

= Is the embed responsive? =

Yes. It adapts to your content width (up to 720px) and adjusts its height automatically depending on the calculator.

= Does it work with the classic editor? =

Yes, with the `[hacecuentas slug="..."]` shortcode.

= What happens if I uninstall the plugin? =

It clears the temporary cache the plugin creates. No residual data is left behind.

== Screenshots ==

1. The "Calculadora Hacé Cuentas" block: one-click buttons for the most-used calculators and a searchable catalog inside the editor.
2. An embedded calculator, ready for the reader to use — with the optional credit linked back to Hacé Cuentas.

== Changelog ==

= 1.1.0 =
* Migrated the picker, block, shortcode and oEmbed integration to the canonical calculator hubs.
* Kept previously saved calculator slugs working through their permanent redirects.
* Restored responsive height updates for redirected and repeated embeds.
* Refreshed the cached catalog automatically after upgrading.

= 1.0.2 =
* Restored the calculator picker and embedded widgets after the Hacé Cuentas catalog migration.
* Updated the catalog endpoint and removed obsolete links.

= 1.0.1 =
* Readme translated to English and documented the external service (hacecuentas.com) with terms and privacy links.

= 1.0.0 =
* Initial release: Gutenberg block, shortcode and oEmbed auto-embed.

== Upgrade Notice ==

= 1.1.0 =
Required after the calculator-to-hub migration. Restores the full catalog and keeps existing embeds compatible.

= 1.0.2 =
Restores the calculator picker and embedded widgets.

= 1.0.1 =
Readme and external-service documentation updated for the WordPress.org directory.

= 1.0.0 =
Initial release.
