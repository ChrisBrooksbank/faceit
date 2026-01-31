# Faceit Project - Prosopagnosia Research & Design

## Executive Summary

Prosopagnosia (face blindness) affects ~2% of the population. While no cure exists, research shows moderate improvements are possible through targeted training. This document captures research findings to inform the Faceit app design.

---

## Part 1: Understanding Prosopagnosia

### What Is It?

Prosopagnosia is a condition where the brain cannot recognize faces despite normal vision. People can see facial features clearly but cannot associate faces with identities.

**Prevalence**: ~1 in 50 people have developmental prosopagnosia.

### Types of Prosopagnosia

| Type                         | Description                                                 | Implications for Training              |
| ---------------------------- | ----------------------------------------------------------- | -------------------------------------- |
| **Developmental/Congenital** | Lifelong from birth, likely genetic (autosomal dominant)    | May respond to holistic training       |
| **Acquired**                 | Results from brain damage (stroke, TBI, neurodegeneration)  | Compensatory strategies more effective |
| **Apperceptive**             | Cannot identify facial characteristics (blurred perception) | Needs perceptual training first        |
| **Associative**              | See features clearly but can't link to identities           | Memory/association training focus      |

### Brain Regions Involved

- **Right Fusiform Gyrus** (Fusiform Face Area/FFA) - primary face processing, holistic representation
- **Right Occipital Face Area (OFA)** - early face perception, feature extraction
- **Right Anterior Temporal Lobe** - face-identity associations, semantic memory

### The Apperceptive vs Associative Distinction

This is a **spectrum**, not a binary:

| Aspect                              | Apperceptive                     | Associative                   |
| ----------------------------------- | -------------------------------- | ----------------------------- |
| **Core deficit**                    | Cannot perceive facial structure | Cannot link percept to memory |
| **Brain region**                    | Fusiform gyrus damage            | Anterior temporal lobe damage |
| **Can match photos?**               | No                               | Yes                           |
| **Can describe faces from memory?** | Mildly impaired                  | Severely impaired             |
| **Best intervention**               | Perceptual training              | Memory/mnemonic training      |

**Key insight**: Subtle perception defects often exist in "associative" cases, and mild memory deficits in "apperceptive" cases. Pure forms are rare.

---

## Part 2: Training Approaches - Deep Dive

### 1. Holistic Face Processing Training

#### The Science

**What is holistic processing?**
Normal face recognition treats faces as unified "gestalts" rather than collections of features. The brain binds features into an indecomposable whole. This is measured by:

- **Composite face effect**: Difficulty ignoring one face-half when judging the other
- **Part-whole effect**: Better recognition of features in face context vs isolation
- **Inversion effect**: Disproportionate difficulty with upside-down faces

**The N170 marker**: An EEG signal occurring ~170ms after seeing a face. It's:

- Larger for faces than objects
- Larger for upright than inverted faces
- Reduced/absent in prosopagnosia
- **Can be normalized with training** (key finding)

**Neural connectivity**: Training increased functional connectivity between FFA and OFA, suggesting the training actually reorganizes brain networks, not just teaches compensatory tricks.

#### The Protocol (DeGutis et al.)

- 3-week online program
- Targets holistic processing specifically
- Discrimination tasks focusing on spatial relations between features (eye-eyebrow distance, nose-mouth distance)

#### Who Responds?

| Finding                                                       | Implication                                                           |
| ------------------------------------------------------------- | --------------------------------------------------------------------- |
| 13/24 (54%) showed improvement                                | Not everyone benefits                                                 |
| Those with **more severe** CFMT scores improved more          | Counterintuitive - worse = more room to grow?                         |
| Responders differed on memory tests, not perception tests     | Suggests holistic training helps memory encoding, not just perception |
| One participant's gains faded after 15 weeks without training | **Maintenance training likely needed**                                |

#### Likelihood of Helping

**More likely to help**:

- Developmental prosopagnosia (vs acquired)
- Those with measurable holistic processing deficits
- Those willing to train consistently for weeks

**Less likely to help**:

- Acquired prosopagnosia with extensive damage
- Those with primarily memory/semantic deficits
- Apperceptive cases (need perceptual training first)

---

### 2. Perceptual Learning / Discrimination Training

#### The Science

**Perceptual learning** is the brain's ability to improve discrimination through practice. Key principles:

1. **Threshold training**: Keep difficulty at the edge of ability (staircase procedure)
2. **Specificity vs transfer**: Learning often specific to trained stimuli, but face training can generalize
3. **3D representation building**: Training with varied views/expressions builds robust internal models

**Why morphed faces work**: Morphing creates a continuous similarity space. Training discrimination at threshold forces the brain to extract the most diagnostic features.

#### The Protocol

| Phase | Stimuli                     | Duration   |
| ----- | --------------------------- | ---------- |
| 1     | Neutral faces, frontal view | Weeks 1-4  |
| 2     | Add varied viewing angles   | Weeks 5-8  |
| 3     | Add varied expressions      | Weeks 9-11 |

**Staircase procedure**:

- Correct answer → next trial harder (more similar faces)
- Incorrect → next trial easier (more different faces)
- Keeps training at ~75% accuracy threshold

#### Who Responds?

| Finding                                                           | Implication                                         |
| ----------------------------------------------------------------- | --------------------------------------------------- |
| Those with **more perceptual deficits** at baseline improved more | Opposite of holistic training!                      |
| Effects generalized to untrained expressions/views                | Suggests true perceptual learning, not memorization |
| Benefits persisted 3+ months                                      | More durable than some other approaches             |
| Some subjects reported daily life improvements                    | Ecological validity achieved                        |

#### Likelihood of Helping

**More likely to help**:

- Apperceptive prosopagnosia
- Acquired prosopagnosia with perceptual deficits
- Those with measurable face discrimination impairment

**Less likely to help**:

- Primarily associative/memory deficits
- Those who can already discriminate faces but can't remember them

---

### 3. Spaced Repetition / Repetition Lag Training

#### The Science

**Spaced repetition** exploits the spacing effect: memories are stronger when learning is distributed over time rather than massed.

**For face-name associations**:

- Landauer & Bjork (1978): First demonstrated with face-name pairs
- Expanding intervals: 1min → 5min → 20min → 1hr → 1day → etc.
- Each successful retrieval strengthens the memory trace

**Why it works**:

- Retrieval practice is more effective than restudying
- Difficulty of retrieval (at the edge of forgetting) strengthens consolidation
- Repeated encoding in different contexts builds robust associations

#### Evidence from Related Populations

| Population                | Result                                                             |
| ------------------------- | ------------------------------------------------------------------ |
| Alzheimer's patients      | Learned face-name associations in <4 sessions on average           |
| Mild cognitive impairment | Mobile app showed memory improvements after 1 month                |
| Healthy adults            | Significant improvement in face recognition vs massed learning     |
| fMRI studies              | Spaced learning enhanced recognition memory with neural correlates |

#### Current Status for Prosopagnosia

- Harvard Medical School: Active clinical trial testing "Repetition Lag Training"
- Not yet widely validated specifically for prosopagnosia
- Theoretical basis is strong given success in other memory disorders

#### Who Would Likely Respond?

**More likely to help**:

- Associative prosopagnosia (memory deficit)
- Those who can perceive faces but forget them
- Training with personally relevant faces (family, coworkers)

**Less likely to help**:

- Apperceptive prosopagnosia (need perception training first)
- If the face percept itself is unstable/unreliable

---

### 4. Compensatory Strategies (Feature Verbalization)

#### The Science

**Feature verbalization** converts face perception into a verbal/semantic task:

- "Large nose, bushy eyebrows, receding hairline"
- Bypasses impaired holistic processing
- Uses intact verbal memory systems

**Why it works immediately**:

- Doesn't require neural reorganization
- Uses existing verbal memory skills
- Can be taught quickly

**Why it has limitations**:

- Labored, slow recognition
- Fails when features are obscured (hat, sunglasses)
- Doesn't generalize to new viewing conditions
- Distinctive features aren't always available

#### For Acquired vs Developmental

| Type                        | Effectiveness                                     |
| --------------------------- | ------------------------------------------------- |
| Acquired prosopagnosia      | Most effective approach per research              |
| Developmental prosopagnosia | Less effective; remedial training may work better |

#### The "Two-Track" Approach

Best practice may be **combining** compensatory with remedial:

1. Compensatory strategies for immediate functional improvement
2. Remedial training (holistic/perceptual) for long-term neural changes

---

## Part 3: Individual Differences - Who Responds to What?

### Key Predictors of Training Response

| Predictor                              | Finding                                                                                                                       | Confidence |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ---------- |
| **DP vs AP**                           | DP shows more treatment success (5/6 studies positive)                                                                        | High       |
| **Severity**                           | Mixed: More severe = more improvement in holistic training; more perceptual deficit = more improvement in perceptual training | Medium     |
| **Type (apperceptive vs associative)** | Match treatment to deficit type                                                                                               | High       |
| **Training intensity**                 | Those reaching harder levels improve more                                                                                     | High       |
| **Age**                                | Adult neuroplasticity exists but may be reduced                                                                               | Low        |
| **Maintenance**                        | Without ongoing training, gains can fade                                                                                      | High       |

### Matching Treatment to Subtype

```
Assessment
    │
    ▼
┌─────────────────────────────────────────────────────┐
│ Can the person discriminate between faces?          │
│ (e.g., CFPT - Cambridge Face Perception Test)       │
└─────────────────────────────────────────────────────┘
    │                           │
    ▼ NO                        ▼ YES
┌─────────────┐         ┌─────────────────────────────┐
│ Apperceptive│         │ Can they remember faces?    │
│ Variant     │         │ (e.g., CFMT)                │
└─────────────┘         └─────────────────────────────┘
    │                           │           │
    ▼                           ▼ NO        ▼ YES
┌─────────────┐         ┌─────────────┐  ┌───────────┐
│ PERCEPTUAL  │         │ Associative │  │ May not   │
│ LEARNING    │         │ Variant     │  │ be DP     │
│ first       │         └─────────────┘  └───────────┘
└─────────────┘                 │
    │                           ▼
    │                   ┌───────────────────┐
    │                   │ SPACED REPETITION │
    │                   │ or HOLISTIC       │
    │                   │ TRAINING          │
    │                   └───────────────────┘
    │                           │
    └───────────────────────────┤
                                ▼
                    ┌───────────────────────┐
                    │ + COMPENSATORY        │
                    │ STRATEGIES always     │
                    └───────────────────────┘
```

### The Neuroplasticity Question

**Can adult brains with DP reorganize?**

Evidence says **yes, but with limits**:

- One patient showed N170 normalization and increased FFA-OFA connectivity after training
- An 89-year-old with acquired prosopagnosia showed full recovery via left hemisphere reorganization
- 5/6 DP treatment studies showed some success
- BUT: gains can fade without maintenance
- BUT: not everyone responds

**Implications**: The brain retains plasticity, but training must be:

- Sustained (weeks to months)
- At appropriate difficulty (threshold training)
- Potentially maintained long-term

---

## Part 4: Assessment - Deep Dive

Understanding user needs requires proper assessment. Research shows matching training to deficit type is critical.

### The Assessment Problem

**Key challenge**: The standard diagnostic test (CFMT) misses 50-65% of people who believe they have prosopagnosia.

**Why?**

- Some can "pass" lab tests using compensatory strategies
- Tests measure specific skills that may not reflect daily life
- Single-session testing has high variability
- Response time isn't always captured (some pass via slower processing)

### Standardized Assessment Tools

#### 1. Cambridge Face Memory Test (CFMT)

**What it measures**: Face memory (learning and recognizing new faces)

**Protocol**:

- 6 target faces to learn
- 72 forced-choice items (which of 3 is a target?)
- Three phases: same-view, novel-view, novel-view with noise
- ~15 minutes

**Scoring**:
| Score | Interpretation |
|-------|----------------|
| 58/72 | Control mean |
| ≤42/72 | 2 SD below mean → prosopagnosia cutoff |
| >65/72 | Super recognizer range |

**Strengths**:

- Most widely used and validated
- Novel faces (no celebrity knowledge needed)
- Increasing difficulty reveals deficit severity

**Limitations**:

- Misses many self-reported prosopagnosics
- Memory-focused (may miss perception-only deficits)
- Single-session may not be reliable
- Age, sex, and ethnic match affect scores

**Best practice**: Use two versions on separate days (e.g., CFMT + CFMT-Australian)

#### 2. Cambridge Face Perception Test (CFPT)

**What it measures**: Face perception (discriminating between faces, no memory required)

**Protocol**:

- Sort 6 morphed faces by similarity to target
- 16 trials: 8 upright, 8 inverted
- Morphs range from 28% to 88% target

**Scoring**:

- Measures error (deviation from correct order)
- Higher score = worse performance
- Cutoff: 2 SD above mean = prosopagnosia

**Critical insight**: CFPT scores don't correlate with CFMT, supporting the perception/memory distinction.

**Use for**: Identifying apperceptive deficits; determining if perception training is needed before memory training.

#### 3. Famous Faces Test (FFT)

**What it measures**: Recognition of familiar/famous faces

**Protocol**: Identify celebrities from photos

**Limitations**:

- Country-specific and time-dependent
- Confounded with pop-culture knowledge
- Context effects (knowing it's a "celebrity test" helps)

**Newer alternative**: Famous Faces Doppelgangers Test (FFDT) - uses similar-looking non-celebrities to separate face recognition from pop-culture knowledge.

#### 4. 20-Item Prosopagnosia Index (PI20)

**What it measures**: Self-reported face recognition difficulty

**Protocol**: 20 Likert-scale questions (1-5 scale)

**Sample items**:

- "I often mistake people I have met before for strangers"
- "When I was at school, I struggled to recognize my classmates"
- "I sometimes find movies hard to follow because of difficulties recognizing characters"
- "I have always had a bad memory for faces"

**Scoring**:
| Score | Interpretation |
|-------|----------------|
| 20-64 | Typical range |
| 65-74 | Mild prosopagnosia likely |
| 75-84 | Moderate prosopagnosia |
| 85-100 | Severe prosopagnosia |

**Validation**: Strong correlation with CFMT (r = -0.68); no correlation with object recognition (face-specific).

**Strengths**:

- Free and easy to administer
- Captures daily life impact
- Good screening tool
- Available under Creative Commons

**Use for**: Initial screening; capturing subjective experience; tracking perceived improvement

### Recommended Assessment Battery

Research suggests using **multiple measures** for accurate diagnosis:

```
┌─────────────────────────────────────────────┐
│           RECOMMENDED PROTOCOL              │
├─────────────────────────────────────────────┤
│                                             │
│  Session 1:                                 │
│  ├─ PI20 questionnaire (5 min)              │
│  ├─ CFMT original version (15 min)          │
│  └─ CFPT (10 min)                           │
│                                             │
│  Session 2 (different day):                 │
│  ├─ CFMT-Australian version (15 min)        │
│  └─ Famous Faces or FFDT (10 min)           │
│                                             │
│  Diagnosis: Impaired on ≥2 of 3 measures    │
│  (>2 SD from control mean)                  │
│                                             │
└─────────────────────────────────────────────┘
```

### Diagnostic Cutoffs Summary

| Test | Prosopagnosia Cutoff | Notes             |
| ---- | -------------------- | ----------------- |
| CFMT | ≤42/72               | 2 SD below mean   |
| CFPT | ≥61 errors           | 2 SD above mean   |
| FFT  | ~50% or below        | Varies by version |
| PI20 | ≥65/100              | Self-report       |

### Age and Demographic Considerations

| Factor       | Effect on Scores                          |
| ------------ | ----------------------------------------- |
| Age 50+      | Significant decline in performance        |
| Ethnic match | Same-ethnicity faces recognized better    |
| Sex          | Small effects in middle-aged/older adults |

**Implication**: App should use age-appropriate norms and diverse face sets.

### Online vs Laboratory Testing

**Good news**: Research shows no significant differences between online and lab testing.

**TestMyBrain.org** has validated online delivery since 2005, testing 3.7+ million people.

**Implications for Faceit**:

- Online/app-based assessment is valid
- Can reach users research centers can't
- Must ensure consistent conditions (lighting, distractions, device)

### App Assessment Strategy

Based on the research, Faceit should implement:

**1. Initial Screening (Onboarding)**

- Adapted PI20 questionnaire
- Quick perception task (mini-CFPT)
- Brief memory task (mini-CFMT)
- Result: User profile (apperceptive vs associative tendency)

**2. Periodic Re-assessment**

- Track improvement over time
- Adjust training difficulty
- Provide motivation via progress visualization

**3. Profile-Based Training Assignment**

| Profile      | Primary Training          | Secondary            |
| ------------ | ------------------------- | -------------------- |
| Apperceptive | Perceptual discrimination | Then memory          |
| Associative  | Spaced repetition memory  | Holistic processing  |
| Mixed        | Alternating modules       | Compensatory toolkit |

### Creating Test Stimuli

**For morphed face discrimination**:

- Software: FantaMorph, FaceFusion, OpenCV-based tools
- Method: Landmark detection → triangulation → warping
- Parameters: Morph percentage (28%-88% creates difficulty gradient)

**For face databases**:

- Publicly available: Utrecht, Face Research Lab London
- Need: Diverse ethnicity, age, expressions
- Challenge: Most research datasets are private

---

## Part 5: Design Implications for Faceit

### Core Design Principles

Based on the research:

1. **Assessment first**: Determine apperceptive vs associative profile before training
2. **Adaptive difficulty**: Staircase procedures keep training at threshold
3. **Multiple modalities**: Offer both perception and memory training
4. **Personal faces**: Use user's actual contacts for ecological validity
5. **Spaced sessions**: Short daily sessions > long weekly sessions
6. **Progress tracking**: Measure improvement over time
7. **Maintenance mode**: Long-term periodic training to retain gains

### Suggested Training Modes

| Mode                     | Target User              | Technique                                               |
| ------------------------ | ------------------------ | ------------------------------------------------------- |
| **Perception Training**  | Apperceptive profile     | Morphed face discrimination with staircase              |
| **Holistic Training**    | DP with holistic deficit | Spatial relations discrimination                        |
| **Memory Training**      | Associative profile      | Spaced repetition with personal faces                   |
| **Compensatory Toolkit** | All users                | Feature verbalization practice, alternate cue awareness |

### Setting Realistic Expectations

The app should communicate:

- This is not a cure
- 50-60% of users may see measurable improvement
- Gains require consistent training (weeks to months)
- Maintenance training likely needed to retain gains
- Combining strategies may work better than single approach

---

## Part 6: User Experience Research

Understanding the lived experience of prosopagnosia is critical for designing an app that actually helps.

### Daily Life Challenges

#### Recognition Failures

| Situation                                       | Frequency/Impact                |
| ----------------------------------------------- | ------------------------------- |
| Not recognizing immediate family out of context | 35% report this                 |
| Recognizing close friends when unexpected       | Only 45% can do this reliably   |
| Recognizing <10 familiar faces total            | 65.5% of prosopagnosics         |
| Recognizing zero faces reliably                 | Most common response in surveys |

**Real example**: "One study participant didn't recognize her husband of 30 years when he unexpectedly came to pick her up from the airport."

#### Workplace Challenges

- Large teams with changing personnel
- Uniforms that remove distinguishing cues
- Networking events and conferences
- High cognitive load situations where strategies fail
- Being perceived as "rude, uncaring, or a bit dim"

#### Social Impact

- Fear of being misjudged leads to social anxiety
- Avoiding social gatherings
- Deliberately keeping small social circles
- Looking back with regret at "poorly developed social skills"
- Difficulty following movies/TV (can't track characters)

### Mental Health Impact

| Condition            | Connection to Prosopagnosia                                   |
| -------------------- | ------------------------------------------------------------- |
| **Social Anxiety**   | Very common; fear of appearing rude or not recognizing people |
| **Depression**       | Linked to social isolation and feelings of inadequacy         |
| **Low Self-Esteem**  | Feeling "different" or inadequate                             |
| **Social Isolation** | Both cause and effect of face recognition difficulties        |

**Key quote**: "Being face blind means living in a world full of strangers... It's actually a source of constant anxiety."

### Current Coping Strategies

People with prosopagnosia already use many strategies. The app should support, not replace, these:

#### What People Already Do

| Strategy                  | How It Works                   | Limitations                                  |
| ------------------------- | ------------------------------ | -------------------------------------------- |
| **Voice recognition**     | Identify by how they sound     | Fails in noisy environments, before speaking |
| **Clothing/accessories**  | Track people by what they wear | Changes daily; uniforms defeat this          |
| **Hair/body shape**       | Distinctive physical features  | Haircuts; multiple people share features     |
| **Context**               | "The person at the front desk" | Fails when people appear unexpectedly        |
| **Spreadsheets/notes**    | Written descriptions of people | Time-consuming; not always accessible        |
| **Greet everyone warmly** | "Hello darling!" approach      | Exhausting; doesn't help with identification |
| **Partner briefings**     | Spouse whispers identities     | Requires constant companion                  |

#### Why Strategies Often Fail

- Appearance changes (haircuts, new clothes, aging)
- Unexpected contexts
- Uniforms in workplace/school
- High cognitive load situations
- Too many people to track

### What Users Actually Need

Based on research and user reports:

#### 1. Real-Time Assistance (Assistive Mode)

**What exists**:

- Wearable cameras with face recognition
- Smartphone apps that identify tagged faces
- AR glasses with overlay (e.g., IdentifiEye)
- OrCam MyEye device

**What users want**:

- Discrete notification (not obvious to others)
- Works in real-time as people approach
- Personal face database (family, coworkers)
- Low friction to add new faces

#### 2. Training for Long-Term Improvement (Training Mode)

**What research shows works**:

- Perceptual discrimination training
- Holistic processing training
- Spaced repetition for memory
- Feature verbalization practice

**What users want**:

- Uses their actual contacts' faces
- Short, daily sessions
- Visible progress over time
- Adaptive difficulty

#### 3. Compensatory Toolkit

**What helps**:

- Feature verbalization practice
- Alternative cue awareness training
- Scripts for disclosure/social situations
- Confidence building

### Disclosure: A Key Decision

**Research finding**: Disclosure has positive effects, yet most adults choose not to disclose at work.

**Why people don't disclose**:

- Fear of being seen as making excuses
- Condition is not well understood
- Worry about job security
- Embarrassment

**Why disclosure helps**:

- Others can adapt (name badges, introductions)
- Reduces anxiety about appearing rude
- In children: improves educational performance and social adjustment

**App opportunity**: Provide disclosure scripts and resources.

### Workplace/School Accommodations That Help

Simple changes make a huge difference:

| Accommodation                          | Impact                       |
| -------------------------------------- | ---------------------------- |
| **Large name badges** at events        | Huge relief                  |
| **Round of introductions** at meetings | Very helpful                 |
| **Chair addresses people by name**     | Helps track who's who        |
| **Seating plans** (no hot-desking)     | Learn who sits where         |
| **Entry-phone/appointment diary**      | Know who's arriving          |
| **Smaller teams**                      | Fewer faces to learn         |
| **Zoom name labels**                   | Identify remote participants |

### Children with Prosopagnosia

Special considerations:

- Often overlooked; seem "shy" or "odd"
- Make friends with children who have distinctive features
- School staff rarely aware of condition
- Need explicit support and disclosure to teachers

### Community Resources

| Resource               | Type               | URL                        |
| ---------------------- | ------------------ | -------------------------- |
| Face Blind UK          | Support + advocacy | faceblind.org.uk           |
| Faceblind.org          | Research + testing | faceblind.org              |
| TestMyBrain            | Online testing     | testmybrain.org            |
| r/Prosopagnosia        | Reddit community   | reddit.com/r/Prosopagnosia |
| London Faceblind Group | In-person support  | via Face Blind UK          |

### Design Implications from UX Research

Based on user needs:

1. **Two modes**: Assistive (real-time help) + Training (long-term improvement)
2. **Personal faces**: Must support user's own contacts, not just stock photos
3. **Discrete**: Notifications shouldn't be obvious to others
4. **Low friction**: Easy to add faces quickly
5. **Short sessions**: Daily 5-10 min > weekly 1 hour
6. **Progress visibility**: Users need to see improvement to stay motivated
7. **Compensatory toolkit**: Not just training; support existing strategies
8. **Disclosure resources**: Scripts, information cards, accommodation guides
9. **Realistic expectations**: Clear about what training can and can't do
10. **Privacy-first**: Face data is extremely sensitive

---

## Part 7: Existing Apps & Competitive Landscape

### The Current Market Gap

**Key finding**: There is no widely available, research-backed app specifically for prosopagnosia face training. Most solutions are either:

- Research prototypes not available to consumers
- General face memory games not designed for prosopagnosia
- Assistive devices (expensive, not training-focused)

### Existing Solutions

#### Assistive Technology (Real-Time Help)

| Product                   | Type                  | Face Recognition         | Training | Price         | Notes                                                    |
| ------------------------- | --------------------- | ------------------------ | -------- | ------------- | -------------------------------------------------------- |
| **OrCam MyEye 3 Pro**     | Wearable camera       | Yes - personal database  | No       | ~$4,500       | Clips to glasses; audio notification; also reads text    |
| **Seeing AI** (Microsoft) | Free iOS/Android app  | Yes - can train on faces | No       | Free          | Describes people, emotions, age; excellent accessibility |
| **SocialRecall**          | Smartphone app        | Yes - event-based        | No       | Varies        | Created by prosopagnosic developer; event-focused        |
| **IdentifiEye**           | AR glasses (research) | Yes - 99% accuracy       | No       | Not available | Research prototype; shows name overlay                   |

**OrCam MyEye - Detailed**

- Pros: Works offline, discrete, hands-free, voice commands
- Cons: Short battery life, expensive, doesn't train (just assists)
- Quote: "There is nothing the MyEye does that apps like Seeing AI can't do... for the awe-inspiring price of free"

**Seeing AI - Detailed**

- Pros: Free, excellent accessibility, multi-purpose, can learn specific faces
- Cons: Not designed specifically for prosopagnosia, no structured training
- Features: Face recognition, emotion detection, text reading, currency, scene description

#### Face Memory Training (General Population)

| App/Game                           | Platform    | Approach                                  | Prosopagnosia-Specific? |
| ---------------------------------- | ----------- | ----------------------------------------- | ----------------------- |
| **Lumosity - What's My Name**      | iOS/Android | Name-face pairs with photorealistic faces | No                      |
| **BrainHQ - Recognition**          | Web/Mobile  | Fusiform face area training               | No                      |
| **Constant Therapy - Match Faces** | Mobile      | Matching faces for cognitive rehab        | No (stroke/TBI focus)   |
| **BrainBashers Face Memory**       | Web         | Reconstruct remembered face               | No                      |
| **Brainfart**                      | Mobile      | Face recognition + spaced repetition      | No                      |

**None of these are designed for prosopagnosia specifically.**

#### Research/Clinical Training Programs

| Program                         | Status             | Approach                            | Available?    |
| ------------------------------- | ------------------ | ----------------------------------- | ------------- |
| DeGutis Lab (Harvard)           | Active trials      | Holistic processing, repetition lag | Research only |
| Perceptual Learning (various)   | Published research | Morphed face discrimination         | Research only |
| Wearable Training System (IEEE) | Prototype          | Combined assistive + training       | Not available |

### What's Missing: The Gap Analysis

| Need                                     | Current Solutions   | Gap                                  |
| ---------------------------------------- | ------------------- | ------------------------------------ |
| **Prosopagnosia-specific training**      | Generic brain games | No app applies research protocols    |
| **Assessment + training combo**          | Separate tools      | No integrated flow                   |
| **Personal faces**                       | Stock photos only   | Can't train on family/coworkers      |
| **Adaptive difficulty**                  | Fixed difficulty    | No staircase procedures              |
| **Profile-based (perception vs memory)** | One-size-fits-all   | No differentiated training           |
| **Progress tracking**                    | Basic or none       | No standardized improvement measures |
| **Maintenance mode**                     | One-time training   | No long-term retention support       |
| **Affordable**                           | OrCam is $4,500     | Need accessible options              |
| **Discrete assistance**                  | Obvious wearables   | Need subtle notification             |

### Why Existing Apps Don't Solve the Problem

1. **General brain games** don't use research-validated protocols
2. **Assistive devices** help in the moment but don't train
3. **Research programs** aren't available to consumers
4. **No assessment** to match training to deficit type
5. **Stock faces** don't transfer to real-life recognition
6. **No maintenance** so gains fade

### Faceit Opportunity

Based on this analysis, Faceit could differentiate by:

1. **Research-backed protocols** - Implement actual scientific methods
2. **Assessment-driven** - Match training to user's deficit profile
3. **Personal + stock faces** - Train on real contacts for ecological validity
4. **Dual mode** - Both training (long-term) and assistance (real-time)
5. **Affordable** - App-based, not expensive hardware
6. **Maintenance built-in** - Ongoing training to retain gains
7. **Progress metrics** - Standardized improvement tracking

### Privacy & Ethics Considerations

Face recognition technology raises serious concerns:

- **Data storage**: Face data is extremely sensitive
- **Consent**: Recording others' faces requires consent
- **On-device processing**: Preferred over cloud for privacy
- **Transparency**: Users should know how data is used

**SocialRecall approach**: All data stored on-device only

**OrCam approach**: Stores features as data set, not actual photos

**Key principle**: User owns their data; nothing leaves device without consent

---

## Sources

### Core Reviews

- [PMC - Rehabilitation of Face Recognition: Critical Review](https://pmc.ncbi.nlm.nih.gov/articles/PMC4107857/)
- [Frontiers - 50 Years of Face Processing Research](https://www.frontiersin.org/journals/human-neuroscience/articles/10.3389/fnhum.2014.00561/full)
- [PMC - Neural Correlates of DP: 25 Years On](https://pmc.ncbi.nlm.nih.gov/articles/PMC10605188/)

### Key Training Studies

- [Oxford Brain - Holistic Training Study (DeGutis)](https://academic.oup.com/brain/article/137/6/1781/2847711)
- [ScienceDirect - Perceptual Learning in DP](https://www.sciencedirect.com/science/article/abs/pii/S0028393219302386)
- [MIT Press - Perceptual Learning in AP](https://direct.mit.edu/jocn/article-abstract/29/3/573/28591)

### Spaced Repetition Research

- [PMC - Spaced Retrieval in Alzheimer's](https://pmc.ncbi.nlm.nih.gov/articles/PMC7174872/)
- [JMIR - Mobile App Spaced Retrieval Study](https://formative.jmir.org/2024/1/e51943)
- [Wikipedia - Spaced Repetition](https://en.wikipedia.org/wiki/Spaced_repetition)

### Neural Mechanisms

- [PMC - Fusiform Face Area](https://pmc.ncbi.nlm.nih.gov/articles/PMC1857737/)
- [Frontiers - Altered FFA Representations in DP](https://www.frontiersin.org/journals/behavioral-neuroscience/articles/10.3389/fnbeh.2021.744466/full)

### Subtypes and Assessment

- [ScienceDirect - Apperceptive vs Associative](https://www.sciencedirect.com/science/article/pii/S0010945213801256)
- [Springer - New Diagnostic Approaches](https://link.springer.com/article/10.3758/s13428-022-02017-w)
- [PubMed - Balanced Integration Score](https://pubmed.ncbi.nlm.nih.gov/38330779/)

### Assessment Tools

- [Royal Society - PI20 Original Paper](https://royalsocietypublishing.org/doi/10.1098/rsos.140343)
- [PMC - PI20 Validation](https://pmc.ncbi.nlm.nih.gov/articles/PMC4632531/)
- [PMC - PI20 Provides Meaningful Evidence](https://pmc.ncbi.nlm.nih.gov/articles/PMC8564608/)
- [PubMed - CFMT Original Validation](https://pubmed.ncbi.nlm.nih.gov/16169565/)
- [PMC - CFMT Item Response Analysis](https://pmc.ncbi.nlm.nih.gov/articles/PMC4461534/)
- [Royal Society - Repeat Assessment Protocol](https://royalsocietypublishing.org/doi/10.1098/rsos.200884)
- [Cognitive Neuropsychology - Age/Sex Effects on CFMT/CFPT](https://www.tandfonline.com/doi/abs/10.1080/02643290903343149)
- [TestMyBrain.org](https://www.testmybrain.org/)
- [Face Blind UK - PI20 Quiz](https://faceblind.org.uk/diagnosis/quiz/)
- [Harvard Faceblind.org](https://www.faceblind.org/research/)

### Clinical Resources

- [Cleveland Clinic - Prosopagnosia Overview](https://my.clevelandclinic.org/health/diseases/23412-prosopagnosia-face-blindness)
- [NHS - Face Blindness](https://www.nhs.uk/conditions/face-blindness/)
- [Faceblind.org - Research](https://www.faceblind.org/research/)

### Clinical Trials

- [Harvard - Cognitive Training Trial](https://www.withpower.com/trial/phase-prosopagnosia-2-2021-daad1)
- [Harvard - Face Recognition Training Trial 2026](https://www.withpower.com/trial/phase-prosopagnosia-3-2023-30485)

### User Experience Research

- [PLOS ONE - Living with DP Survey 2025](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0322469)
- [PsyPost - Even Mild DP Disrupts Daily Life](https://www.psypost.org/developmental-prosopagnosia-even-mild-face-blindness-can-severely-disrupt-daily-life/)
- [The Conversation - Mild Face Blindness Study](https://theconversation.com/even-mild-face-blindness-can-cause-serious-difficulties-in-daily-life-new-study-254644)
- [PMC - Psychosocial Impact on Children](https://pmc.ncbi.nlm.nih.gov/articles/PMC4211255/)
- [Face Blind UK - Employment](https://faceblind.org.uk/resources/factsheets/employment/)
- [Face Blind UK - Coping Strategies](https://faceblind.org.uk/living/strategies/)
- [PubMed - Coping Strategies Study](https://pubmed.ncbi.nlm.nih.gov/31161896/)
- [Seattle Anxiety - Hidden Social Struggles](https://seattleanxiety.com/psychiatrist/2023/7/20/the-hidden-social-struggles-of-face-blindness)

### Assistive Technology

- [IEEE - Wearable Assistive System](https://ieeexplore.ieee.org/document/9283058/)
- [TechRxiv - IdentifiEye AR Glasses](https://www.techrxiv.org/users/795931/articles/1180213-identifieye-transforming-social-connections-for-people-with-prosopagnosia)
- [MDPI - AR 3D Face Recognition](https://www.mdpi.com/2079-9292/14/7/1244)
- [CBC - Technology Helping Face Blindness](https://www.cbc.ca/documentaries/the-nature-of-things/this-woman-can-t-recognize-her-own-daughter-s-face-but-technology-is-helping-her-1.6312174)
- [Scientific American - App Helps Remember Faces](https://www.scientificamerican.com/article/new-app-helps-people-remember-faces/)

### Existing Apps and Devices

- [Scientific American - SocialRecall](https://www.scientificamerican.com/article/new-app-helps-people-remember-faces/)
- [AFB - OrCam MyEye Review](https://afb.org/aw/19/8/15066)
- [Amazon - OrCam MyEye 3 Pro](https://www.amazon.com/OrCam-Advanced-Vision-Impairment-Wearable/dp/B0CVHHPFCT)
- [Microsoft - Seeing AI](https://www.microsoft.com/en-us/garage/wall-of-fame/seeing-ai/)
- [Lumosity - What's My Name Game](https://www.lumosity.com/en/blog/whats-my-name-the-new-game-for-remembering-names-and-faces)
- [BrainHQ - Recognition](https://www.brainhq.com/why-brainhq/about-the-brainhq-exercises/peopleskills/recognition/)
- [Medium - Can Technology Help Face Blindness?](https://medium.com/@lamyeemanick/can-technology-help-face-blindness-43ce845c9e75)
