import React, { useState, useEffect } from 'react';

// ---------- Wikipedia / Wikimedia Commons image lookup ----------
const wikiCache = new Map();

async function searchOnce(query, source) {
  const base =
    source === 'commons'
      ? 'https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6' +
        `&gsrsearch=${encodeURIComponent(query)}&gsrlimit=8` +
        '&prop=imageinfo&iiprop=url&iiurlwidth=900&format=json&origin=*'
      : 'https://en.wikipedia.org/w/api.php?action=query&generator=search' +
        `&gsrsearch=${encodeURIComponent(query)}&gsrlimit=5` +
        '&prop=pageimages&piprop=thumbnail&pithumbsize=900&format=json&origin=*';

  const res = await fetch(base);
  const data = await res.json();
  const pages = Object.values(data?.query?.pages || {}).sort((a, b) => a.index - b.index);

  for (const p of pages) {
    if (source === 'commons') {
      const info = p.imageinfo?.[0];
      if (info?.thumburl && /\.(jpe?g|png|webp)$/i.test(p.title)) return info.thumburl;
    } else if (p.thumbnail?.source) {
      return p.thumbnail.source;
    }
  }
  return null;
}

async function fetchWikiImage(query, source = 'wikipedia') {
  const queries = Array.isArray(query) ? query : [query];
  const key = source + '|' + queries.join('|');
  if (wikiCache.has(key)) return wikiCache.get(key);

  for (const q of queries) {
    try {
      const src = await searchOnce(q, source);
      if (src) {
        wikiCache.set(key, src);
        return src;
      }
    } catch {
      /* try next query */
    }
  }
  wikiCache.set(key, null);
  return null;
}

// `direct` = an exact image URL (or imported local file). If given, no searching happens.
function WikiImg({ query, source, direct, alt, className }) {
  const [src, setSrc] = useState(direct || null);
  const [failed, setFailed] = useState(false);
  const key = (Array.isArray(query) ? query.join('|') : query) + '|' + (direct || '');

  useEffect(() => {
    let alive = true;
    setFailed(false);
    if (direct) {
      setSrc(direct);
      return;
    }
    setSrc(null);
    fetchWikiImage(query, source).then(s => {
      if (!alive) return;
      s ? setSrc(s) : setFailed(true);
    });
    return () => { alive = false; };
  }, [key, source]);

  if (failed) {
    return (
      <div className={`${className} flex items-center justify-center bg-[#1e2d24] text-[#798a71] text-xs font-mono`}>
        image unavailable
      </div>
    );
  }
  if (!src) {
    return <div className={`${className} bg-[#1e2d24] animate-pulse`} />;
  }
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}

// ---------- Data ----------
const portfolioData = {
  name: "Dr. José P. Rizal",
  title: "Polymath, Physician, Author & National Reformer",
  bio: "A versatile intellectual and visionary dedicated to the scientific, social, and literary enlightenment of the Philippines. Adept at cross-disciplinary practices spanning ophthalmology, structural engineering, fine arts, and sociopolitical critique.",
  skills: [
    "Ophthalmology & Surgery",
    "Novels & Literary Arts",
    "Sculpture & Fine Arts",
    "Polyglot (22+ Languages)",
    "Civic Engineering & Agriculture",
    "Strategic Advocacy"
  ]
};

const timelineData = [
  {
    year: "1861",
    role: "Origin",
    title: "Birth in Calamba, Laguna",
    desc: "Born on June 19, 1861, into the principalia class. Cultivated early interests in arts, poetry, and philosophy under maternal mentorship.",
    placeName: "Rizal Shrine, Calamba, Laguna",
    q: "Rizal Shrine Calamba"
  },
  {
    year: "1877 - 1882",
    role: "Education",
    title: "Ateneo & University of Santo Tomas",
    desc: "Graduated with highest honors as a Bachelor of Arts from Ateneo Municipal de Manila. Advanced into medicine and philosophy studies.",
    placeName: "Intramuros, Manila (Ateneo / UST)",
    q: "Intramuros Manila"
  },
  {
    year: "1882",
    role: "Venture",
    title: "European Migration & Research",
    desc: "Secretly departed for Spain aboard the Salvadora. Expanded medical training across Madrid, Paris, and Heidelberg, specializing in ophthalmology.",
    placeName: "Heidelberg & Madrid, Europe",
    q: "Heidelberg Castle"
  },
  {
    year: "1887",
    role: "Publication",
    title: "Author of Noli Me Tangere",
    desc: "Published his landmark sociopolitical novel in Berlin, exposing ecclesiastical corruption and colonial maladministration.",
    placeName: "Berlin, Germany",
    q: "Berlin Cathedral"
  },
  {
    year: "1891",
    role: "Publication",
    title: "Author of El Filibusterismo",
    desc: "Released his profound sequel in Ghent, Belgium, exploring themes of radical revolution and systemic injustice.",
    placeName: "Ghent, Belgium",
    q: "Ghent Belgium Gravensteen"
  },
  {
    year: "1892",
    role: "Leadership",
    title: "La Liga Filipina & Dapitan Exile",
    desc: "Founded a progressive civic reform league in Manila. Following his arrest, spent 4 years in Dapitan engineering public water utilities and schools.",
    placeName: "Dapitan City, Zamboanga del Norte",
    q: "Rizal Shrine Dapitan"
  },
  {
    year: "1896",
    role: "Legacy",
    title: "Execution at Bagumbayan",
    desc: "Falsely condemned for sedition, his martyrdom on December 30, 1896, permanently catalyzed the Philippine independence movement.",
    placeName: "Rizal Monument, Luneta (Bagumbayan)",
    q: "Rizal Monument Luneta Manila"
  }
];

const artifactsData = [
  {
    id: 1,
    title: "Mi Último Adiós (1896)",
    category: "Literary Works & Poetry",
    desc: "Rizal's farewell poem, written in Fort Santiago on the eve of his execution in December 1896. It is widely regarded as one of the finest works of Philippine literature.",
    q: ["Mi último adiós"],
    img: "https://i.pinimg.com/736x/4b/c7/7c/4bc77c59e9e2ecb51a4eddf7f6ac4fae.jpg",
    tag: "Poetry"
  },
  {
    id: 2,
    title: "The Dapitan Relief Map of Mindanao (1892)",
    category: "Civic Engineering & Art",
    desc: "A massive outdoor relief map constructed by Rizal in the Dapitan town plaza to teach geography and topography to locals.",
    q: "Rizal Dapitan relief map Mindanao",
    img: null,
    tag: "Engineering"
  },
  {
    id: 3,
    title: "The Mother's Revenge (Sculpture)",
    category: "Sculpture & Fine Arts",
    desc: "A symbolic terra cotta sculpture created by Rizal depicting a mother dog defending her puppy from a crocodile, mirroring colonial oppression.",
    q: ["Revenge of the Mother Rizal", "Mother's Revenge Rizal sculpture", "Rizal sculpture dog crocodile"],
    source: "commons",
    img: null,
    tag: "Art"
  },
  {
    id: 4,
    title: "Noli Me Tangere (1887)",
    category: "Literary Works",
    desc: "Written in Spanish and published in Berlin (1887) using funds lent by Maximo Viola. It ignited the spark of national consciousness.",
    q: "Noli Me Tangere novel Rizal",
    img: null,
    tag: "Literature"
  }
];

const quizQuestions = [
  {
    q: "1. In what year was José Rizal born?",
    options: ["1850", "1861", "1872", "1882"],
    answer: 1
  },
  {
    q: "2. Which novel was dedicated to the executed Gomburza priests?",
    options: ["Noli Me Tangere", "El Filibusterismo", "A La Juventud Filipina", "Mi Ultimo Adiós"],
    answer: 1
  },
  {
    q: "3. Where was Rizal exiled for four years starting in 1892?",
    options: ["Madrid", "Dapitan", "Hong Kong", "Fort Santiago"],
    answer: 1
  },
  {
    q: "4. Who funded the publication of Rizal's first novel, Noli Me Tangere?",
    options: ["Paciano Rizal", "Maximo Viola", "Ferdinand Blumentritt", "Marcelo H. del Pilar"],
    answer: 1
  },
  {
    q: "5. What was Rizal's primary medical specialization?",
    options: ["Cardiology", "Ophthalmology", "Neurology", "Pediatrics"],
    answer: 1
  },
  {
    q: "6. What name did Rizal use on his passport when he secretly left for Europe?",
    options: ["José Mercado", "José Alcala", "Rizal Alonzo", "Dimasalang"],
    answer: 0
  },
  {
    q: "7. Which civic organization did Rizal found upon returning to Manila in 1892?",
    options: ["Katipunan", "La Solidaridad", "La Liga Filipina", "Propaganda Club"],
    answer: 2
  },
  {
    q: "8. At what age was Rizal executed at Bagumbayan?",
    options: ["29", "33", "35", "40"],
    answer: 2
  },
  {
    q: "9. Which institution did Rizal graduate from with highest honors as a Bachelor of Arts?",
    options: ["University of Santo Tomas", "Ateneo Municipal de Manila", "San Juan de Letran", "Colegio de San Jose"],
    answer: 1
  },
  {
    q: "10. What is the official date commemorating Rizal's execution?",
    options: ["June 19, 1861", "July 3, 1892", "December 30, 1896", "June 12, 1898"],
    answer: 2
  }
];

// ---------- App ----------
export default function App() {
  const [activeNav, setActiveNav] = useState('portfolio');
  const [selectedImage, setSelectedImage] = useState(null);

  // Quiz state
  const [userAnswers, setUserAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const handleOptionChange = (qIndex, optIndex) => {
    setUserAnswers({ ...userAnswers, [qIndex]: optIndex });
  };

  const submitQuiz = () => {
    let currentScore = 0;
    quizQuestions.forEach((item, index) => {
      if (userAnswers[index] === item.answer) {
        currentScore += 1;
      }
    });
    setScore(currentScore);
    setSubmitted(true);
  };

  const resetQuiz = () => {
    setUserAnswers({});
    setSubmitted(false);
    setScore(0);
  };

  return (
    <div className="min-h-screen bg-[#141b16] text-[#e6dfcc] font-serif selection:bg-[#c5a880] selection:text-[#141b16] relative">

      {/* Portfolio Navbar */}
      <nav className="border-b border-[#2b3a31] bg-[#141b16]/95 backdrop-blur sticky top-0 z-40 px-6 py-4 flex justify-between items-center max-w-5xl mx-auto">
        <div className="font-mono tracking-widest text-sm text-[#c5a880] uppercase flex items-center gap-2">
          <span>📜</span> JR.portfolio // 1896
        </div>
        <div className="flex gap-4 md:gap-6 font-sans text-xs uppercase tracking-wider">
          <button
            onClick={() => setActiveNav('portfolio')}
            className={`transition-colors ${activeNav === 'portfolio' ? 'text-[#c5a880] font-bold border-b border-[#c5a880]' : 'text-[#a3b19b] hover:text-[#e6dfcc]'}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveNav('gallery')}
            className={`transition-colors ${activeNav === 'gallery' ? 'text-[#c5a880] font-bold border-b border-[#c5a880]' : 'text-[#a3b19b] hover:text-[#e6dfcc]'}`}
          >
            Artifact Gallery
          </button>
          <button
            onClick={() => setActiveNav('quiz')}
            className={`transition-colors ${activeNav === 'quiz' ? 'text-[#c5a880] font-bold border-b border-[#c5a880]' : 'text-[#a3b19b] hover:text-[#e6dfcc]'}`}
          >
            Quiz (10 Pts)
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12">

        {activeNav === 'portfolio' && (
          <div className="space-y-16 animate-fadeIn">

            {/* Hero Section */}
            <header className="border-b border-[#2b3a31] pb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-4 max-w-2xl">
                <div className="inline-block px-3 py-1 bg-[#1e2d24] text-[#c5a880] text-[11px] font-mono tracking-widest uppercase border border-[#2b3a31]">
                  Available for Reform & Enlightenment
                </div>
                <h1 className="text-4xl md:text-5xl font-normal tracking-tight text-[#f4f1ea]">
                  {portfolioData.name}
                </h1>
                <p className="text-lg text-[#c5a880] font-serif italic">
                  {portfolioData.title}
                </p>
                <p className="text-sm text-[#a3b19b] leading-relaxed font-serif">
                  {portfolioData.bio}
                </p>
                <div className="pt-2 flex gap-3">
                  <button
                    onClick={() => setActiveNav('gallery')}
                    className="px-4 py-2 bg-[#c5a880] text-[#141b16] font-sans text-xs uppercase font-bold tracking-widest hover:bg-[#d4b892] transition-all"
                  >
                    View Artifacts & Art →
                  </button>
                </div>
              </div>
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-2 border-[#c5a880] bg-[#1e2d24] flex items-center justify-center text-4xl shadow-lg shrink-0 overflow-hidden relative">
                <WikiImg
                  query="José Rizal"
                  alt="Jose Rizal"
                  className="w-full h-full object-cover filter sepia-[0.3]"
                />
              </div>
            </header>

            {/* Core Competencies / Skills */}
            <section className="space-y-6">
              <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-[#c5a880]">
                // Core Expertise & Skills
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {portfolioData.skills.map((skill, idx) => (
                  <div key={idx} className="p-4 bg-[#1b2720] border border-[#2b3a31] rounded-sm text-sm text-[#d4ded0] font-sans flex items-center justify-between">
                    <span>{skill}</span>
                    <span className="text-[#c5a880] text-xs font-mono">✦</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Timeline & Places Section */}
            <section className="space-y-6">
              <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-[#c5a880]">
                // Chronological Journey & Places
              </h2>
              <div className="space-y-8 border-l border-[#2b3a31] pl-6 ml-2">
                {timelineData.map((item, idx) => (
                  <div key={idx} className="relative space-y-3 bg-[#1b2720]/60 p-5 border border-[#2b3a31] rounded-sm">
                    <div className="absolute -left-[37px] top-6 w-3 h-3 rounded-full bg-[#141b16] border-2 border-[#c5a880]" />

                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs text-[#c5a880] bg-[#141b16] px-2 py-0.5 border border-[#2b3a31]">{item.year}</span>
                      <span className="text-xs uppercase tracking-wider text-[#798a71] font-sans">{item.role}</span>
                    </div>

                    <h3 className="text-xl font-normal text-[#f4f1ea]">{item.title}</h3>
                    <p className="text-sm text-[#a3b19b] leading-relaxed">{item.desc}</p>

                    {/* Place / Location Image Card */}
                    <div className="pt-2">
                      <div className="text-[11px] font-mono text-[#c5a880] mb-2 flex items-center gap-1">
                        <span>📍 Location:</span> <span>{item.placeName}</span>
                      </div>
                      <div
                        onClick={() => setSelectedImage({ title: item.placeName, category: `Historical Site (${item.year})`, desc: item.desc, q: item.q, source: item.source, img: item.img })}
                        className="h-48 rounded-sm overflow-hidden border border-[#2b3a31] bg-black/40 cursor-pointer relative group"
                      >
                        <WikiImg
                          query={item.q}
                          source={item.source}
                          direct={item.img}
                          alt={item.placeName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter sepia-[0.2]"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-mono text-white">
                          [ Click to Expand Place Image ]
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

          </div>
        )}

        {activeNav === 'gallery' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="border-b border-[#2b3a31] pb-4">
              <h2 className="text-2xl font-normal text-[#f4f1ea]">Artifact & Works Gallery</h2>
              <p className="text-xs text-[#a3b19b] font-sans mt-1">
                Explore visual representations of his works, sculptures, and engineering. <span className="text-[#c5a880]">(Click any image to expand)</span>
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {artifactsData.map((art) => (
                <div key={art.id} className="bg-[#1b2720] border border-[#2b3a31] rounded-sm overflow-hidden flex flex-col justify-between group">
                  <div>
                    <div
                      onClick={() => setSelectedImage(art)}
                      className="h-56 overflow-hidden bg-black/40 cursor-pointer relative"
                    >
                      <WikiImg
                        query={art.q}
                        source={art.source}
                        direct={art.img}
                        alt={art.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter sepia-[0.1]"
                      />
                      <div className="absolute top-2 right-2 bg-[#141b16]/90 text-[#c5a880] text-[10px] font-mono px-2 py-1 border border-[#2b3a31]">
                        {art.tag}
                      </div>
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs font-mono text-white bg-black/50">
                        [ Click to Inspect Image ]
                      </div>
                    </div>

                    <div className="p-5 space-y-2">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-[#c5a880]">{art.category}</span>
                      <h3 className="text-lg text-[#f4f1ea]">{art.title}</h3>
                      <p className="text-xs text-[#a3b19b] leading-relaxed font-serif">{art.desc}</p>
                    </div>
                  </div>

                  <div className="p-5 pt-0 flex justify-between items-center text-xs font-sans text-[#798a71] border-t border-[#2b3a31]/40 mt-4">
                    <span>Archival Record #{art.id}</span>
                    <button
                      onClick={() => setSelectedImage(art)}
                      className="text-[#c5a880] hover:underline font-mono text-[11px]"
                    >
                      Enlarge View →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeNav === 'quiz' && (
          <div className="bg-[#1b2720] border border-[#2b3a31] p-6 md:p-8 rounded-sm space-y-8 animate-fadeIn">

            <div className="border-b border-[#2b3a31] pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-xl font-normal text-[#f4f1ea]">Historical Knowledge Verification</h2>
                <p className="text-xs text-[#a3b19b] font-sans mt-1">A 10-point evaluation designed to test archive comprehension.</p>
              </div>
              {submitted && (
                <div className="bg-[#141b16] text-[#c5a880] px-4 py-2 font-mono text-sm border border-[#c5a880]">
                  Score: {score} / 10
                </div>
              )}
            </div>

            <div className="space-y-8">
              {quizQuestions.map((item, qIdx) => (
                <div key={qIdx} className="pb-6 border-b border-[#2b3a31]/60">
                  <p className="text-sm font-semibold text-[#f4f1ea] mb-3">{item.q}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 font-sans">
                    {item.options.map((opt, optIdx) => {
                      const isSelected = userAnswers[qIdx] === optIdx;
                      const isCorrect = item.answer === optIdx;

                      let optionStyle = "bg-[#141b16] border-[#2b3a31] text-[#a3b19b] hover:border-[#c5a880]";
                      if (submitted) {
                        if (isCorrect) optionStyle = "bg-[#23382b] border-[#52796f] text-[#d8f3dc] font-bold";
                        else if (isSelected && !isCorrect) optionStyle = "bg-[#3d1c1c] border-[#9b2226] text-[#f8d7da]";
                      } else if (isSelected) {
                        optionStyle = "bg-[#25362c] border-[#c5a880] text-[#f4f1ea] font-medium";
                      }

                      return (
                        <label
                          key={optIdx}
                          className={`flex items-center gap-3 p-3 border cursor-pointer transition-all text-xs ${optionStyle}`}
                        >
                          <input
                            type="radio"
                            name={`q-${qIdx}`}
                            checked={isSelected}
                            disabled={submitted}
                            onChange={() => handleOptionChange(qIdx, optIdx)}
                            className="accent-[#c5a880] cursor-pointer"
                          />
                          <span className="font-serif">{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center pt-4 font-sans">
              {!submitted ? (
                <button
                  onClick={submitQuiz}
                  className="px-8 py-3 bg-[#c5a880] text-[#141b16] font-bold text-xs uppercase tracking-widest hover:bg-[#d4b892] transition-colors shadow-md"
                >
                  Submit Assessment
                </button>
              ) : (
                <button
                  onClick={resetQuiz}
                  className="px-8 py-3 bg-[#c5a880] text-[#141b16] font-bold text-xs uppercase tracking-widest hover:bg-[#d4b892] transition-colors shadow-md"
                >
                  Retake Evaluation
                </button>
              )}
            </div>

          </div>
        )}

      </main>

      {/* Image Modal Preview Lightbox */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1b2720] border border-[#c5a880] max-w-2xl w-full rounded-sm overflow-hidden shadow-2xl animate-fadeIn">
            <div className="bg-[#141b16] px-4 py-3 border-b border-[#2b3a31] flex justify-between items-center">
              <span className="text-xs font-mono text-[#c5a880] uppercase">Visual Inspector // {selectedImage.category}</span>
              <button
                onClick={() => setSelectedImage(null)}
                className="text-[#e6dfcc] hover:text-white font-mono text-sm px-2 py-0.5 border border-[#2b3a31]"
              >
                ✕ Close
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="h-72 bg-black/60 rounded-sm overflow-hidden flex items-center justify-center">
                <WikiImg
                  query={selectedImage.q}
                  source={selectedImage.source}
                  direct={selectedImage.img}
                  alt={selectedImage.title}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h3 className="text-xl text-[#f4f1ea]">{selectedImage.title}</h3>
                <p className="text-xs text-[#a3b19b] mt-2 font-serif leading-relaxed">{selectedImage.desc}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Portfolio Footer */}
      <footer className="border-t border-[#2b3a31] mt-20 py-8 text-center text-xs font-mono text-[#798a71] space-y-2">
        <p>© 1896 José P. Rizal // Digital Heritage Portfolio & Archive</p>
        <p className="text-[#a3b19b]">Developed by Justine Salcedo, Kenneth Rivera & Lance Warren Vendiola</p>
      </footer>

    </div>
  );
}