// Prints what each topic's Listen button reads, as JSON ({ topicId: text }), for scripts/make-audio.py.
//   npx tsx scripts/speech-text.ts > /tmp/speech.json
import { TOPICS } from "@/lib/study/data";
import { speechText } from "@/lib/study/speech";

process.stdout.write(JSON.stringify(Object.fromEntries(TOPICS.map((t) => [t.id, speechText(t)])), null, 2));
