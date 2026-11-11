# শব্দ ও বাক্যের অডিও

Node.js 20.12+ প্রয়োজন; অতিরিক্ত npm প্যাকেজ লাগে না। প্রজেক্টের মূল ফোল্ডার থেকে চালান।

```sh
node scripts/generate-course-audio.mjs
```

এটি API কল ছাড়াই তালিকা তৈরি করে। পার্সার সরাসরি `src/esho-pages.js`-এর `bookPages.words`, `bookPages.examples` এবং `src/esho-data.js`-এর lesson examples পড়ে। একই লেখা ও একই ধরন একবার তৈরি হয়, সব পৃষ্ঠা/পাঠের রেফারেন্স থাকে। হরকত বাদ দেওয়া হয় না। বর্তমান উপাত্তে ৩৯৬টি স্বতন্ত্র শব্দ-এন্ট্রি ও ১৭৩টি উদাহরণ-বাক্য/বাক্যাংশ আছে। এটি PDF-এর সম্পূর্ণ কনটেন্ট বা নিয়মের গদ্য ও quiz distractors-এর তালিকা নয়। এই কাজের সময় মূল পৃষ্ঠার ছবি পুনরায় যাচাই করা হয়নি।

Google AI Studio থেকে Gemini API key নিয়ে git-ignored `.env.local` ফাইলে রাখুন:

```dotenv
GEMINI_API_KEY=your_key_here
```

আগে তিনটি অডিও তৈরি করে শুনুন:

```sh
node --env-file=.env.local scripts/generate-course-audio.mjs --generate --limit=3
```

সব বাকি অডিও তৈরি/পুনরায় চালানো:

```sh
node --env-file=.env.local scripts/generate-course-audio.mjs --generate
```

API ব্যবহারে খরচ/কোটা প্রযোজ্য। ত্রুটি বা quota limit হলে থামে; পরে একই কমান্ডে বাকি কাজ চলে। একসঙ্গে একটিমাত্র generator চালান। `GEMINI_TTS_MODEL` ও `GEMINI_TTS_VOICE` দিয়ে মডেল/কণ্ঠ বদলালে নতুন profile তৈরি হয়। Default: Gemini 3.8 Flash TTS / Charon।

## মাখরাজ ও সিফাত যাচাই আবশ্যক

Prompt-এ মাখরাজ, সিফাত, হরকত, শাদ্দা, তানউইন, স্বাভাবিক মাদ এবং স্বাভাবিক বাক্যপাঠের নির্দেশ আছে। শেষের লিখিত ইরাব শিক্ষা দেওয়ার জন্য উচ্চারণ করতে বলা হয়েছে। TTS এই নির্দেশ সবসময় মেনে চলবে—এ নিশ্চয়তা নেই। স্বয়ংক্রিয় transcript মিললেও তা সূক্ষ্ম উচ্চারণের সার্টিফিকেশন নয়।

অডিও: `public/audio/course/<profile>/<id>.wav`

তালিকা ও রেফারেন্স: `output/course-audio/<profile>/manifest.json`

প্রতিটি অডিও প্রথমে `pending`। আরবি উচ্চারণে দক্ষ পর্যালোচক মূল পৃষ্ঠার লেখা মিলিয়ে এবং পুরো অডিও শুনে বর্ণের মাখরাজ/সিফাত, ছোট স্বর বনাম মাদ, শাদ্দা/সুকুন, ইরাব, শব্দ বাদ পড়া/বাড়তি বলা ও বাক্যের সংযোগ যাচাই করবেন। সত্যিই যাচাই শেষে সেই অডিওর ID অনুমোদন দিন:

```sh
node scripts/generate-course-audio.mjs --approve=ID --reviewer='পর্যালোচকের নাম'
```

অনুমোদিত অডিও সাইটের lookup-এ যোগ করুন:

```sh
node scripts/generate-course-audio.mjs --export-approved
```

এটি স্থানীয় `src/word-audio.json` আপডেট করে; deploy করে না। আগের অডিও entry অক্ষত থাকে; এই profile-এর অননুমোদিত entry বাদ যায়। সাইটে অন্য লেখার জন্য পুরোনো device-TTS fallback এখনও থাকবে; সেটির মাখরাজ/সিফাত যাচাই হয়নি।

ভুল অডিও আবার তৈরি করতে:

```sh
node --env-file=.env.local scripts/generate-course-audio.mjs --generate --id=ID --limit=1
```

আগে export করা থাকলে সংশ্লিষ্ট entry `src/word-audio.json` থেকে সরাতে হবে; স্ক্রিপ্ট অনুমোদিত live file সরাসরি বদলাতে দেয় না। নতুন অডিও আবার শুনে অনুমোদন প্রয়োজন। প্রতিটি অনুমোদন নির্দিষ্ট audio hash-এর সঙ্গে রাখা হয়।

API reference: https://ai.google.dev/gemini-api/docs/speech-generation
