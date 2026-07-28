import type { HubData } from '../types';

/**
 * Hub EN — "How much space is this, and how long will it take to move?"
 *
 * Absorbe 5 calculadoras: conversión de unidades de datos (binario vs decimal),
 * capacidad útil de un arreglo RAID, tasa de compresión, tamaño estimado de un repo git
 * y tiempo de transferencia por USB.
 *
 * Constantes espejadas de las fórmulas reales:
 *  - conversion-bytes-kb-mb-gb-tb.ts (base 1024 / 1000)
 *  - raid-capacidad-discos-redundancia.ts (capacidad útil por nivel)
 *  - tasa-compresion-archivo-zip.ts (ratio y ahorro)
 *  - tamano-repo-git-commits-branches.ts (factor 0,6 de packfile + 2 KB por commit)
 *  - velocidad-usb-transferencia-archivo.ts (velocidades reales sostenidas por versión)
 */

/** Unidades en orden ascendente. */
export const DATA_UNITS = ['B', 'KB', 'MB', 'GB', 'TB'];

/** Velocidad real sostenida por versión de USB, en MB/s (no el pico de la caja). */
export const USB_SPEEDS: Record<string, number> = {
  '2.0': 35,
  '3.0': 400,
  '3.1': 800,
  '3.2': 1500,
  '4.0': 3500,
};

/** Gbps nominales que anuncia cada versión, para contrastar con la velocidad real. */
export const USB_MARKETED_GBPS: Record<string, number> = {
  '2.0': 0.48,
  '3.0': 5,
  '3.1': 10,
  '3.2': 20,
  '4.0': 40,
};

/** Git: el packfile comprime el árbol de trabajo a ~60% en código típico. */
export const GIT_PACK_RATIO = 0.6;
/** Git: overhead aproximado por commit en el directorio .git, en KB. */
export const GIT_KB_PER_COMMIT = 2;

const DISCLAIMER =
  'Estimate based on the figures you enter. Verify units, assumptions and rounding before you rely on it — real capacity, compression and transfer speed all depend on the specific hardware and data involved.';

export const hub: HubData = {
slug: 'en/tech/storage-and-file-size',
  title: 'Data Size, RAID Capacity, Compression, Repo Size and Transfer Time Calculator',
  description:
    'Convert bytes, KB, MB, GB and TB in binary or decimal, work out usable RAID capacity and what redundancy costs you, measure a compression ratio, estimate a git repository’s size and how long a file takes to copy over USB.',
  silo: 'Tech',
siloHref: '/en/tech',
  locale: 'en',

  eyebrow: 'Storage & transfer',
  h1: 'How much space is this, and how long will it take?',
  lede:
    'The two questions that follow every file around: how big is it really, and how long before it finishes moving. Unit conversion that respects the 1024-versus-1000 split, usable capacity after RAID takes its cut, what compression actually bought you, how large a repository is getting, and the honest transfer time behind the Gbps number on the box.',
  stamps: [
    'Binary (1024) and decimal (1000) kept separate — that is the "missing" space on a new drive',
    'USB figures are real sustained throughput, not the marketed peak',
    'RAID capacity by level, with the redundancy cost shown explicitly',
    'Replaces 5 single-purpose calculators',
  ],

  resultLabel: 'Your number',

  cases: {
    title: 'Which size question is it?',
    intro:
      'Pick what you are working out. Only the fields that case needs get read — the rest are ignored.',
    items: [
      {
        id: 'convert',
        label: 'Convert between B, KB, MB, GB and TB',
        hint: 'Both directions, in binary (1024) or decimal (1000) — the difference that makes a new drive look smaller.',
        yes: [
          'The value converted into the unit you asked for',
          'The same quantity expressed in raw bytes',
          'What the other numbering system would give you',
          'How large the binary-versus-decimal gap is at this size',
        ],
        warn: [
          DISCLAIMER,
          'Drive manufacturers use decimal (1 TB = 1,000,000,000,000 bytes) and Windows reports binary (1 TiB = 1,099,511,627,776 bytes). That is the whole reason a "1 TB" drive shows up as 931 GB — no space is missing, the two are just counting differently.',
          'The gap grows with size: about 2.4% at the kilobyte level, but roughly 9.9% by the terabyte. On a 4 TB drive that is around 370 GB of apparent difference.',
          'Network speeds are quoted in bits per second and file sizes in bytes. A 1 Gbps link moves at most about 125 MB/s before overhead — dividing by eight is the step people forget.',
        ],
        plazo: 'macOS and Linux now report decimal GB while Windows still reports binary, so the same drive can show two different sizes on two machines. Both are correct.',
        answer:
          'Binary uses 1024 per step and decimal uses 1000. A "1 TB" drive is one decimal terabyte, which is 0.909 binary terabytes — displayed as about 931 GB.',
      },
      {
        id: 'raid',
        label: 'Usable capacity of a RAID array',
        hint: 'What you actually get after redundancy, and how many disks the array survives.',
        yes: [
          'Usable capacity in TB for the level you chose',
          'Raw capacity, and how much redundancy consumes',
          'How many simultaneous disk failures it survives',
          'The storage efficiency as a percentage',
        ],
        warn: [
          DISCLAIMER,
          'RAID is not a backup. It protects against a disk dying; it does nothing about a deleted file, ransomware, a failed controller, a fire or a mistake — all of which are faithfully mirrored across every disk instantly.',
          'RAID 0 has no redundancy at all and multiplies risk: with any disk lost the whole array is gone, so more disks means a higher chance of total loss, not a lower one.',
          'Rebuilding a large RAID 5 array puts every remaining disk under sustained full-speed read for hours or days — exactly when a second, same-age disk is most likely to fail. That is why RAID 6 or RAID 10 is preferred once disks get large.',
        ],
        plazo: 'Keep at least one copy of anything that matters outside the array, and test that you can actually restore it.',
        answer:
          'RAID 0 gives you every byte and no protection. RAID 5 costs one disk, RAID 6 costs two, RAID 1 and RAID 10 cost half the total.',
      },
      {
        id: 'compress',
        label: 'How much compression actually saved',
        hint: 'Reduction percentage, compression ratio and megabytes saved.',
        yes: [
          'Reduction as a percentage of the original',
          'The compression ratio expressed as n:1',
          'Megabytes and gigabytes saved',
          'What the saving means over repeated transfers',
        ],
        warn: [
          DISCLAIMER,
          'Already-compressed formats barely shrink. JPEG, PNG, MP3, MP4, and most video and audio containers are already entropy-coded, so zipping them typically saves 0–3% while costing CPU time on both ends.',
          'Text, source code, logs, CSV and uncompressed databases are the opposite: 70–95% reductions are routine, because they are full of repetition.',
          'Higher compression levels cost disproportionately more time for progressively less gain. Going from a fast setting to maximum often takes several times longer for a few percent — worth it for something archived once and downloaded often, wasteful otherwise.',
        ],
        plazo: 'Compress once for anything you distribute repeatedly; the CPU cost is paid a single time and the bandwidth saving repeats with every download.',
        answer:
          'Reduction = 1 − (compressed ÷ original). Dropping 100 MB to 30 MB is a 70% reduction, a 3.33:1 ratio and 70 MB saved.',
      },
      {
        id: 'repo',
        label: 'How big a git repository is getting',
        hint: 'Working tree plus the .git directory, from file count, average size and commit count.',
        yes: [
          'Estimated size of the working tree',
          'Estimated size of the .git directory',
          'The total a fresh clone would pull down',
          'Whether the size warrants Git LFS or splitting the repo',
        ],
        warn: [
          DISCLAIMER,
          'Git history is permanent by default. Committing a large binary once leaves it in the object database forever, even after you delete the file — every clone from then on downloads it. Removing it means rewriting history, which breaks every existing clone.',
          'This estimate assumes text-like content that packs to roughly 60% of its size. A repository full of images, video, compiled artefacts or datasets will be far larger, because those do not delta-compress between versions.',
          'Once a repository passes a few hundred megabytes, clone and fetch times start to hurt on slow connections and in CI, where a fresh clone can happen on every single build.',
        ],
        plazo: 'Put binaries and large assets in Git LFS from the first commit — retrofitting it later means rewriting history for everyone.',
        answer:
          'Total ≈ working tree + .git, where .git is roughly 60% of the tree in packed objects plus about 2 KB of overhead per commit.',
      },
      {
        id: 'usb',
        label: 'How long a file takes to copy over USB',
        hint: 'Real sustained transfer time by USB generation, against the marketed Gbps figure.',
        yes: [
          'Transfer time at realistic sustained speed',
          'How many gigabytes per minute that generation moves',
          'The gap between the marketed Gbps and the real MB/s',
          'What the same file would take on USB 2.0, for scale',
        ],
        warn: [
          DISCLAIMER,
          'The Gbps figure on the box is the raw signalling rate of the bus, in bits. Divide by eight for bytes, then subtract protocol overhead and you land at the sustained numbers used here — commonly 60–75% of the headline.',
          'The slowest link in the chain sets the speed. A USB 4 port copying to a mechanical hard drive runs at hard-drive speed, around 100–150 MB/s, no matter what the port is capable of.',
          'Many thousands of small files transfer far slower than one large file of the same total size, because each file carries its own filesystem overhead. Copying a source tree can take several times longer than copying an archive of it.',
        ],
        plazo: 'Archive small files into a single container before copying them to external media; it usually beats compressing them.',
        answer:
          'Time = size ÷ sustained speed. A 10 GB file takes about 4.3 minutes on USB 3.0 at around 400 MB/s, and roughly 5 hours on USB 2.0.',
      },
    ],
  },

  inputsTitle: 'The numbers you have',
  inputsIntro: 'Fill in the fields for the case you picked — everything else is ignored.',
  fields: [
    { id: 'value', label: 'Value to convert', type: 'number', value: 1, min: 0, step: 0.001, thousands: true },
    {
      id: 'from',
      label: 'From',
      type: 'select',
      value: 'TB',
      options: [
        { value: 'B', label: 'Bytes (B)' },
        { value: 'KB', label: 'Kilobytes (KB)' },
        { value: 'MB', label: 'Megabytes (MB)' },
        { value: 'GB', label: 'Gigabytes (GB)' },
        { value: 'TB', label: 'Terabytes (TB)' },
      ],
    },
    {
      id: 'to',
      label: 'To',
      type: 'select',
      value: 'GB',
      options: [
        { value: 'B', label: 'Bytes (B)' },
        { value: 'KB', label: 'Kilobytes (KB)' },
        { value: 'MB', label: 'Megabytes (MB)' },
        { value: 'GB', label: 'Gigabytes (GB)' },
        { value: 'TB', label: 'Terabytes (TB)' },
      ],
    },
    {
      id: 'system',
      label: 'Numbering system',
      type: 'select',
      value: 'bin',
      options: [
        { value: 'bin', label: 'Binary — 1024 per step (what Windows reports)' },
        { value: 'dec', label: 'Decimal — 1000 per step (what drive makers print)' },
      ],
    },
    {
      id: 'raid',
      label: 'RAID level',
      type: 'select',
      value: '5',
      options: [
        { value: '0', label: 'RAID 0 — striping, no redundancy' },
        { value: '1', label: 'RAID 1 — mirroring' },
        { value: '5', label: 'RAID 5 — striping with single parity' },
        { value: '6', label: 'RAID 6 — dual parity' },
        { value: '10', label: 'RAID 10 — mirrored then striped' },
      ],
    },
    { id: 'disks', label: 'Number of disks', type: 'number', value: 4, min: 1, max: 64, step: 1 },
    { id: 'diskTb', label: 'Capacity of each disk', type: 'number', value: 4, suffix: 'TB', min: 0.1, max: 100, step: 0.5 },
    { id: 'original', label: 'Original file size', type: 'number', value: 100, suffix: 'MB', min: 0, step: 1, thousands: true },
    { id: 'compressed', label: 'Compressed file size', type: 'number', value: 30, suffix: 'MB', min: 0, step: 1, thousands: true },
    { id: 'files', label: 'Tracked files in the repository', type: 'number', value: 500, min: 0, step: 10, thousands: true },
    { id: 'kbAvg', label: 'Average size of a tracked file', type: 'number', value: 120, suffix: 'KB', min: 0, step: 5 },
    { id: 'commits', label: 'Number of commits', type: 'number', value: 1000, min: 0, step: 100, thousands: true },
    { id: 'fileGb', label: 'File you are copying', type: 'number', value: 10, suffix: 'GB', min: 0.01, step: 0.5 },
    {
      id: 'usb',
      label: 'USB generation',
      type: 'select',
      value: '3.0',
      options: [
        { value: '2.0', label: 'USB 2.0 — 480 Mbps marketed, ~35 MB/s real' },
        { value: '3.0', label: 'USB 3.0 / 3.1 Gen 1 — 5 Gbps marketed, ~400 MB/s real' },
        { value: '3.1', label: 'USB 3.1 Gen 2 — 10 Gbps marketed, ~800 MB/s real' },
        { value: '3.2', label: 'USB 3.2 Gen 2×2 — 20 Gbps marketed, ~1,500 MB/s real' },
        { value: '4.0', label: 'USB 4 — 40 Gbps marketed, ~3,500 MB/s real' },
      ],
    },
  ],
  fineprint: DISCLAIMER,

  chart: {
    type: 'donut',
    title: 'How the number splits',
    caption:
      'The composition behind the result — usable capacity against what redundancy consumes, compressed bytes against bytes saved, working tree against the .git directory.',
  },

  breakdownTitle: 'Line by line',
  breakdownIntro:
    'Binary and decimal are kept strictly separate, so a conversion and its inverse return exactly the number you started with.',

  faq: [
    {
      q: 'Why does my 1 TB drive show up as only 931 GB?',
      a: 'Nothing is missing. The manufacturer counts a terabyte as 1,000,000,000,000 bytes (decimal), while Windows divides by 1024 at every step (binary) and calls the result GB. One decimal terabyte is 1,000,000,000,000 ÷ 1024³, which is 931.32 binary gigabytes. Both figures describe exactly the same drive.',
    },
    {
      q: 'What is the difference between GB and GiB?',
      a: 'GiB is the unambiguous binary unit: 1 GiB = 1024³ = 1,073,741,824 bytes. GB, strictly speaking, means 10⁹ = 1,000,000,000 bytes. In practice most operating systems display binary quantities but label them GB, which is precisely where the confusion comes from. The gap is about 7.4% at the gigabyte and 9.9% at the terabyte.',
    },
    {
      q: 'How do I convert Mbps to MB/s?',
      a: 'Divide by eight, since there are eight bits in a byte. A 300 Mbps connection tops out around 37.5 MB/s of payload, and in practice a bit less after protocol overhead. This is the single most common mix-up in anything involving download times, and it makes a factor-of-eight difference.',
    },
    {
      q: 'How much usable space do I get from RAID 5?',
      a: 'The capacity of all your disks minus one. Four 4 TB disks in RAID 5 give 12 TB usable, with 4 TB consumed by parity, and the array survives one disk failing. RAID 6 costs two disks instead of one but survives two simultaneous failures, which matters increasingly as disks get larger and rebuilds take longer.',
    },
    {
      q: 'Is RAID a backup?',
      a: 'No, and treating it as one is how people lose data. RAID protects against a disk failing. It does not protect against a deleted file, ransomware, a corrupted filesystem, a failed controller, theft or fire — all of which are replicated instantly and faithfully across every disk in the array. You still need a separate copy, ideally offsite, and you need to test restoring from it.',
    },
    {
      q: 'Why does zipping a video barely make it smaller?',
      a: 'Because it is already compressed. MP4, JPEG, PNG, MP3 and similar formats have already had their redundancy removed by a codec designed for that specific kind of data, so a general-purpose compressor finds almost nothing left to exploit — typically 0–3%. Text, code, logs and CSV are the opposite case and routinely shrink by 70–95%.',
    },
    {
      q: 'What is a good compression ratio?',
      a: 'It depends entirely on the content, so the ratio is only meaningful against a comparable baseline. Plain text and logs commonly reach 4:1 to 10:1. Source code lands around 3:1 to 5:1. Already-compressed media sits near 1:1. A poor ratio on media is not a broken tool — it is a signal that compressing it was not worth the CPU time.',
    },
    {
      q: 'Why is my git repository so much bigger than my files?',
      a: 'Because .git holds every version of everything ever committed, not just the current state. Git compresses and delta-encodes aggressively, so text history is cheap, but a large binary committed once stays in the object database forever and is downloaded by every clone. Deleting the file later does not remove it from history — only rewriting history does, and that breaks every existing clone.',
    },
    {
      q: 'When should I move to Git LFS?',
      a: 'As soon as you know binaries are coming, and ideally before the first one is committed. LFS stores large files outside the normal object database and pulls only the versions actually checked out. Adding it from the start is easy; retrofitting it means rewriting history and coordinating a re-clone across everyone using the repository.',
    },
    {
      q: 'Why is my USB transfer slower than the advertised speed?',
      a: 'Three reasons stack up. The advertised figure is in bits, so divide by eight for bytes. Protocol overhead removes a further 25–40%. And the slowest device in the chain sets the ceiling — a USB 4 port writing to a mechanical hard drive runs at hard-drive speed, around 100–150 MB/s, and no port upgrade changes that.',
    },
    {
      q: 'Why do lots of small files copy so much slower than one big one?',
      a: 'Every file carries fixed per-file costs: directory entries, metadata writes, and on flash media an erase-block penalty. Those costs are paid once per file rather than once per gigabyte, so ten thousand small files can take several times longer than a single archive of exactly the same total size. Packing them into one container first is usually the fastest route.',
    },
    {
      q: 'How long does it take to copy 100 GB?',
      a: 'At USB 3.0 speeds of roughly 400 MB/s, about 4.3 minutes per 10 GB, so around 43 minutes for 100 GB — assuming the destination drive can keep up. On USB 2.0 at about 35 MB/s the same 100 GB takes close to 50 hours, which is why USB 2.0 external drives were unusable long before they disappeared.',
    },
  ],

  sources: [
    { name: 'Prefixes for binary multiples (KiB, MiB, GiB, TiB)', url: 'https://physics.nist.gov/cuu/Units/binary.html', publisher: 'NIST' },
    { name: 'IEC 80000-13 — quantities and units for information science', url: 'https://www.iso.org/standard/31898.html', publisher: 'ISO / IEC' },
    { name: 'USB specifications and data rates by generation', url: 'https://www.usb.org/documents', publisher: 'USB Implementers Forum' },
    { name: 'RAID levels and common configurations (SNIA dictionary)', url: 'https://www.snia.org/education/what-is-raid', publisher: 'SNIA' },
    { name: 'Git internals — packfiles and object storage', url: 'https://git-scm.com/book/en/v2/Git-Internals-Packfiles', publisher: 'Git SCM / Pro Git' },
    { name: 'Git Large File Storage (LFS)', url: 'https://git-lfs.com/', publisher: 'Git LFS project' },
  ],

  replaces: [
    '/en/conversion-bytes-kb-mb-gb-tb',
    '/en/raid-capacity-calculator',
    '/en/file-compression-ratio',
    '/en/git-repo-size-calculator',
    '/en/usb-transfer-time-calculator',
  ],

lastReviewed: '2026-07-28',
};
