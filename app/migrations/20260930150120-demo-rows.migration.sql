-- demo rows: the instructor, three courses, four students with purchases,
-- progress and questions

insert into users (email, name, passwordHash, role) values
  ('iris@lecturemint.test',  'Iris Calder',   crypt('watercolor', genSalt('bf', 12)), 'instructor'),
  ('maya@lecturemint.test',  'Maya Okafor',   crypt('paintalong', genSalt('bf', 12)), 'student'),
  ('theo@lecturemint.test',  'Theo Lindqvist', crypt('paintalong', genSalt('bf', 12)), 'student'),
  ('priya@lecturemint.test', 'Priya Raman',   crypt('paintalong', genSalt('bf', 12)), 'student'),
  ('sam@lecturemint.test',   'Sam Whitaker',  crypt('paintalong', genSalt('bf', 12)), 'student');

insert into courses (slug, title, tagline, level, priceCents, coverAsset, published, createdAt, description) values
  ('wet-on-wet-skies', 'Wet-on-Wet Skies', 'Graded washes, soft clouds and glowing sunsets on damp paper.', 'Beginner', 4900, 'wet-on-wet-skies', true, now() - interval '90 days',
$d$Skies are the best place to start with watercolor, because they reward letting go. In this course you will learn to read how wet your paper is, load a brush with the right amount of pigment, and let color move on its own.

You will finish with a small library of skies you can drop above any landscape: clear morning washes, drifting cumulus, stormy blooms and a full sunset.

**What you need:** a 1" flat brush, a size 12 round, cold-press paper (300 gsm or heavier), masking tape, and three pigments: ultramarine, burnt sienna and a warm yellow.$d$),
  ('botanical-watercolor', 'Botanical Watercolor', 'Leaves, petals and small bouquets built from transparent glazes.', 'Intermediate', 7900, 'botanical-watercolor', true, now() - interval '60 days',
$d$Botanical painting is patient work, and this course breaks it into habits you can practice in twenty minutes at a time.

We start by looking: how a leaf is built, where the light turns. Then we glaze thin transparent layers, control soft and hard edges on petals, use negative painting for veins, and bring it together in a small bouquet.

**What you need:** a size 6 and size 2 round, hot- or cold-press paper, an HB pencil, a kneaded eraser, and a limited palette of a cool and warm version of each primary.$d$),
  ('loose-landscapes', 'Loose Landscapes', 'Paint big shapes first, suggest the details, and learn when to put the brush down.', 'All levels', 9900, 'loose-landscapes', true, now() - interval '30 days',
$d$Loose painting is not careless painting. It is deciding what matters and saying it in as few strokes as possible.

Over eight lessons we move from value thumbnails to a finished lakeside scene: distant hills, trees that read without every leaf, water and reflections, texture from salt and spatter, and the hardest skill of all, knowing when a painting is done.

**What you need:** a large mop or flat, a size 10 round, a rigger, table salt, and paper you are not afraid to waste.$d$);

insert into lessons (courseId, position, title, videoAsset, durationSeconds, notes)
select c.id, v.position, v.title, v.videoAsset, v.durationSeconds, v.notes
  from (values
    ('wet-on-wet-skies', 1, 'Materials and paper prep', 'sky-1', 10,
$n$Good skies start before you touch a brush.

## Stretch or tape

Tape all four edges of your paper to a board with masking tape, pressing it down firmly. Wet paper buckles; tape keeps it flat enough for washes to settle evenly.

## Your palette

- **Ultramarine** for the top of the sky
- **Burnt sienna** to grey it down for clouds
- **A warm yellow** (new gamboge or quinacridone gold) for sunsets

> Tip: squeeze fresh paint for washes. Dried pan color takes too long to rewet into a strong mix.

## Homework

Tape two quarter sheets and wet one with a clean brush. Watch how long the shine takes to disappear. That timing is what the next five lessons are about.$n$),
    ('wet-on-wet-skies', 2, 'Mixing a sky palette', 'sky-2', 11,
$n$Mix more paint than you think you need. Running out halfway through a wash is the most common way a sky fails.

## Three puddles

1. A strong ultramarine, the consistency of milk
2. The same blue with a touch of burnt sienna, for cloud shadows
3. A pale yellow, the consistency of tea

Test each on scrap paper. Watercolor dries **about 30% lighter** than it looks wet, so judge your mix after it dries.

## Warm and cool

A sky gets warmer and lighter toward the horizon. Keep your yellow puddle clean so it stays luminous next to the blue.$n$),
    ('wet-on-wet-skies', 3, 'Laying a graded wash', 'sky-3', 12,
$n$A graded wash moves from strong color to almost nothing without a visible line.

## Steps

1. Tilt your board about 15 degrees
2. Lay a band of strong blue across the top
3. Dip into water, not paint, and lay the next band so it touches the bead at the bottom of the first
4. Repeat, diluting each band, until you reach the horizon

Keep a **bead of wet paint** at the bottom edge the whole time. If it dries, you get a hard line.

## Common problems

- *Stripes:* your bands are too far apart in time. Work faster or use a bigger brush.
- *Backruns:* you added wetter paint into a drying area. See the next lesson.$n$),
    ('wet-on-wet-skies', 4, 'Blooms and backruns on purpose', 'sky-4', 13,
$n$A bloom (or cauliflower) happens when wetter paint flows into a damper area and pushes pigment outward.

Most beginners fight them. In skies they can read as billowing cloud edges, so we learn to place them.

## Try this

- Lay a medium blue wash and wait until the shine *just* disappears
- Drop clean water from a loaded round brush into the area
- Watch the edge form and leave it alone

The timing window is small, often under a minute. Make five tests on one sheet and note how damp the paper was for each.$n$),
    ('wet-on-wet-skies', 5, 'Lifting clouds with a thirsty brush', 'sky-5', 10,
$n$Lifting removes paint to reveal lighter paper. It is the fastest way to make soft clouds.

## A thirsty brush

Rinse your round, then squeeze it almost dry with a tissue. Touch it to the damp wash and it drinks the paint back up.

## Shaping clouds

- Lift the **top edges** crisp, so the cloud catches light
- Leave the bottoms soft and add your grey mix under them
- Rinse and squeeze between every lift, or you put paint back

Staining pigments like phthalo blue lift poorly. Ultramarine lifts beautifully, which is why we chose it.$n$),
    ('wet-on-wet-skies', 6, 'Sunset sky, start to finish', 'sky-6', 12,
$n$Everything comes together: wet the paper, float in yellow near the horizon, bring blue down from the top, and let the two meet without mixing into green.

## Order of work

1. Wet the whole sky area evenly
2. Yellow in the bottom third
3. A thin rose or sienna band above it
4. Blue from the top, stopping short of the yellow
5. Clouds lifted, then shadowed
6. Once **bone dry**, paint a dark hill silhouette along the bottom

The silhouette is what makes the sky glow. Keep it simple and very dark.$n$),

    ('botanical-watercolor', 1, 'Observing leaf structure', 'bot-1', 12,
$n$Before painting, spend ten minutes drawing one leaf from life.

## What to look for

- The **midrib** and how it curves
- Where the leaf turns and shows its underside
- How the edge is serrated, smooth or lobed

Draw lightly with an HB pencil. Heavy graphite shows through transparent washes and smudges into them.$n$),
    ('botanical-watercolor', 2, 'Glazing transparent layers', 'bot-2', 13,
$n$Glazing is painting a thin transparent layer over a completely dry one. The layers mix optically, like stained glass.

## Rules for clean glazes

1. The layer underneath must be **completely dry**, not just touch-dry
2. Use transparent pigments
3. Make one confident pass and do not scrub

Build a leaf in three glazes: a pale yellow-green overall, a mid-green on the shadow side, then a small dark accent where the leaf overlaps itself.$n$),
    ('botanical-watercolor', 3, 'Petals: soft edges, hard edges', 'bot-3', 10,
$n$Every petal has both kinds of edge. A hard edge says *this is in front*; a soft edge says *this turns away*.

## Softening an edge

Paint the petal, then run a damp (not wet) brush along the edge you want to soften while the paint is still wet.

## Practice

Paint five petals in a row, softening a different side of each. Which ones look like they curl toward you?$n$),
    ('botanical-watercolor', 4, 'Veins and negative painting', 'bot-4', 11,
$n$Light veins are not painted, they are *left*. Negative painting means painting the spaces around a shape to reveal it.

## Steps

1. Lay the base glaze over the whole leaf and let it dry
2. Paint the next glaze between the veins, leaving thin lines of the first layer
3. Repeat once more near the midrib for depth

Take your time. A wobbly vein looks natural; a fat one looks like a mistake.$n$),
    ('botanical-watercolor', 5, 'Color temperature in greens', 'bot-5', 12,
$n$Tube greens look flat. Mixing your own gives you warm and cool greens that make leaves turn in space.

| Mix | Use |
| --- | --- |
| Lemon yellow + phthalo blue | Cool, bright new growth |
| Gamboge + ultramarine | Warm, natural mid-green |
| Any green + a touch of red | Shadows and older leaves |

Cool greens recede. Warm greens come forward. Use both on the same leaf.$n$),
    ('botanical-watercolor', 6, 'Composing a small bouquet', 'bot-6', 13,
$n$Three to five flowers is plenty. Aim for variety in size and direction.

## Composition checklist

- One **focal flower**, fully painted and highest in contrast
- Supporting flowers painted looser and paler
- Leaves that lead the eye back toward the focal flower
- Lots of white paper around the arrangement

Plan with a quick pencil thumbnail before you commit.$n$),
    ('botanical-watercolor', 7, 'Finishing details', 'bot-7', 10,
$n$Stop earlier than feels comfortable, then add only a few small darks.

## Last touches

- A thin dark line where two petals overlap
- A tiny cast shadow under the stem
- A few pollen dots with the tip of a size 2 round

Then sign small, in a corner, in a color from the painting.$n$),

    ('loose-landscapes', 1, 'Thumbnail value studies', 'land-1', 11,
$n$A value study is a small painting in one color that decides where the lights and darks go.

## Make three thumbnails

Each about the size of a playing card, in a single grey:

1. The **light** shapes, left as paper
2. The **middle** values, one flat wash
3. The **darks**, small and deliberate

If the thumbnail works, the painting will. If it does not, no color will save it.$n$),
    ('loose-landscapes', 2, 'Big shapes first', 'land-2', 12,
$n$Squint at your scene until the details disappear. What is left are three or four big shapes: sky, distant land, middle ground, foreground.

Paint each big shape in **one wash** with your largest brush. Details come last, if at all.$n$),
    ('loose-landscapes', 3, 'Painting distant hills', 'land-3', 13,
$n$Distance makes things cooler, lighter and softer. That is called *atmospheric perspective*.

## For far hills

- Mix a pale blue-violet
- Paint the whole hill in one pass, wet into a damp sky for a soft top edge
- Keep them lighter than anything in the foreground

Each range closer to you gets a little warmer, darker and sharper.$n$),
    ('loose-landscapes', 4, 'Trees without every leaf', 'land-4', 10,
$n$A tree is a silhouette with holes in it.

## Technique

1. Hold a round brush near the end and dab the tree mass with the side of the brush
2. Leave a few gaps for sky holes
3. While it is damp, drop a darker mix into the shadow side
4. Add a trunk and a few branches with a rigger once dry

Do not paint leaves. Paint the *idea* of foliage.$n$),
    ('loose-landscapes', 5, 'Water and reflections', 'land-5', 11,
$n$Still water reflects what is above it, a little darker and directly below.

## Steps

- Paint the reflection with vertical strokes while the water area is damp
- Once dry, lift a few **horizontal** lines with a thirsty flat brush for ripples
- Leave a thin line of white paper where water meets the shore

The horizontal marks are what tell the eye it is water.$n$),
    ('loose-landscapes', 6, 'Salt, spatter and texture', 'land-6', 12,
$n$Texture adds interest in places the eye passes over, like foreground grass or rocky shores.

## Salt

Sprinkle table salt into a wash just as the shine goes. Each grain pulls pigment into a small starburst. Brush it off only when bone dry.

## Spatter

Tap a loaded brush against another brush handle over the foreground. Cover the sky with scrap paper first.

Use texture in one area, not everywhere.$n$),
    ('loose-landscapes', 7, 'Knowing when to stop', 'land-7', 13,
$n$Overworking is the most common way a loose painting dies.

## Ask three questions

1. Does the value pattern still match the thumbnail?
2. Is there one clear place for the eye to rest?
3. Would one more stroke *say* something new?

If the answer to the last one is no, put the brush down and walk away for an hour.$n$),
    ('loose-landscapes', 8, 'Full demo: lakeside morning', 'land-8', 11,
$n$A complete painting from blank paper, using every lesson in this course.

## Order

1. Thumbnail and light pencil guides
2. Sky wet-on-wet, soft and pale
3. Distant hills into the damp sky
4. Middle ground trees, big shapes only
5. Lake and reflections
6. Foreground texture and a few final darks

Paint along with the video, pausing as often as you need.$n$)
  ) as v(slug, position, title, videoAsset, durationSeconds, notes)
  join courses c on c.slug = v.slug;

insert into purchases (userId, courseId, amountCents, status, paidAt, createdAt)
select u.id, c.id, c.priceCents, 'paid', now() - (v.daysAgo || ' days')::interval, now() - (v.daysAgo || ' days')::interval
  from (values
    ('maya@lecturemint.test',  'wet-on-wet-skies',     80),
    ('maya@lecturemint.test',  'botanical-watercolor', 41),
    ('theo@lecturemint.test',  'wet-on-wet-skies',     22),
    ('priya@lecturemint.test', 'wet-on-wet-skies',     65),
    ('priya@lecturemint.test', 'botanical-watercolor', 50),
    ('priya@lecturemint.test', 'loose-landscapes',      9),
    ('sam@lecturemint.test',   'loose-landscapes',     18)
  ) as v(email, slug, daysAgo)
  join users u on u.email = v.email
  join courses c on c.slug = v.slug;

-- Each student has finished the first n lessons of a course.
insert into lessonProgress (userId, lessonId)
select u.id, l.id
  from (values
    ('maya@lecturemint.test',  'wet-on-wet-skies',     6),
    ('maya@lecturemint.test',  'botanical-watercolor', 3),
    ('theo@lecturemint.test',  'wet-on-wet-skies',     2),
    ('priya@lecturemint.test', 'wet-on-wet-skies',     4),
    ('priya@lecturemint.test', 'botanical-watercolor', 7),
    ('priya@lecturemint.test', 'loose-landscapes',     1),
    ('sam@lecturemint.test',   'loose-landscapes',     5)
  ) as v(email, slug, done)
  join users u on u.email = v.email
  join courses c on c.slug = v.slug
  join lessons l on l.courseId = c.id and l.position <= v.done;

insert into questions (id, lessonId, parentId, userId, userName, fromInstructor, body, createdAt)
select v.id::uuid, l.id, v.parentId::uuid, u.id, u.name, u.role = 'instructor', v.body, now() - (v.hoursAgo || ' hours')::interval
  from (values
    ('019a0000-0000-7000-8000-000000000001', null, 'wet-on-wet-skies', 3, 'theo@lecturemint.test', 30,
     'My graded wash keeps getting stripes halfway down. I am using a size 12 round. Is the brush too small?'),
    ('019a0000-0000-7000-8000-000000000002', '019a0000-0000-7000-8000-000000000001', 'wet-on-wet-skies', 3, 'iris@lecturemint.test', 26,
     'Probably, yes. A round holds less water, so each band dries before you reach it. Try a 1" flat, and mix twice as much paint as you think you need. Tilt the board a little more too.'),
    ('019a0000-0000-7000-8000-000000000003', null, 'wet-on-wet-skies', 5, 'priya@lecturemint.test', 52,
     'Lifting works great with ultramarine but my phthalo sky will not budge. Any way to rescue it?'),
    ('019a0000-0000-7000-8000-000000000004', '019a0000-0000-7000-8000-000000000003', 'wet-on-wet-skies', 5, 'iris@lecturemint.test', 49,
     'Phthalo stains the paper fibres, so it will only lift a little. Once dry, scrub gently with a damp synthetic brush and blot. For the next one, save phthalo for a glaze on top.'),
    ('019a0000-0000-7000-8000-000000000005', null, 'botanical-watercolor', 2, 'maya@lecturemint.test', 5,
     'How long should I wait between glazes? Mine look dry after five minutes but the next layer still lifts the first.'),
    ('019a0000-0000-7000-8000-000000000006', null, 'loose-landscapes', 4, 'sam@lecturemint.test', 3,
     'Do you ever use masking fluid for the sky holes, or is that cheating in a loose painting?'),
    ('019a0000-0000-7000-8000-000000000007', null, 'wet-on-wet-skies', 1, 'maya@lecturemint.test', 200,
     'Is 300 gsm student-grade paper okay to start with, or should I get cotton paper right away?'),
    ('019a0000-0000-7000-8000-000000000008', '019a0000-0000-7000-8000-000000000007', 'wet-on-wet-skies', 1, 'iris@lecturemint.test', 190,
     'Cotton makes wet-on-wet much easier because it stays damp longer. Use student paper for exercises and save a few cotton sheets for finished skies.')
  ) as v(id, parentId, slug, position, email, hoursAgo, body)
  join users u on u.email = v.email
  join courses c on c.slug = v.slug
  join lessons l on l.courseId = c.id and l.position = v.position
 order by v.hoursAgo desc;
