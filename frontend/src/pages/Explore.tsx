import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Heart, Calendar, Filter, Film, X } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const MOVIES = [
  // English
  { id: 1,  title: 'Inception',                        release: '2010-07-16', language: 'English',    poster: 'https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg',                                             genre: 'Sci-Fi'     },
  { id: 2,  title: 'Interstellar',                      release: '2014-11-05', language: 'English',    poster: 'https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGVhLFExZjUtZmIyNGZlNDg4NWQwXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg',             genre: 'Sci-Fi'     },
  { id: 3,  title: 'The Dark Knight',                   release: '2008-07-18', language: 'English',    poster: 'https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX300.jpg',                                             genre: 'Action'     },
  { id: 4,  title: 'The Shawshank Redemption',          release: '1994-09-23', language: 'English',    poster: 'https://m.media-amazon.com/images/M/MV5BNDE3ODcxYzMtY2YzZC00NmNlLWJiNDMtZDViZWM2MzIxZDYwXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_SX300.jpg',             genre: 'Drama'      },
  { id: 5,  title: 'Spider-Man: Across the Spider-Verse', release: '2023-06-02', language: 'English', poster: 'https://m.media-amazon.com/images/M/MV5BMzI0NmVkMjEtYmY4MS00ZWEzLWEzM2ItYTRmN2U1OGRlMzBiXkEyXkFqcGdeQXVyMDM2NDM2MQ@@._V1_SX300.jpg',             genre: 'Animation'  },
  { id: 6,  title: 'The Godfather',                     release: '1972-03-24', language: 'English',    poster: 'https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg',             genre: 'Crime'      },
  { id: 7,  title: 'Avengers: Endgame',                 release: '2019-04-26', language: 'English',    poster: 'https://m.media-amazon.com/images/M/MV5BMTc5MDE2ODcwNV5BMl5BanBnXkFtZTgwMzI2NzQ2NzM@._V1_SX300.jpg',                                             genre: 'Action'     },
  { id: 8,  title: 'Forrest Gump',                      release: '1994-07-06', language: 'English',    poster: 'https://m.media-amazon.com/images/M/MV5BNWIwODRlZTUtY2U3ZS00Yzg1LWJhNzYtMmZiYmEyNmU1NjMzXkEyXkFqcGdeQXVyMTQxNzMzNDI@._V1_SX300.jpg',             genre: 'Drama'      },
  // Hindi
  { id: 9,  title: 'Dangal',                            release: '2016-12-21', language: 'Hindi',      poster: 'https://m.media-amazon.com/images/M/MV5BMTQ4MzQzMzM2Nl5BMl5BanBnXkFtZTgwMTQ1NzU3MDI@._V1_SX300.jpg',                                             genre: 'Sports'     },
  { id: 10, title: '3 Idiots',                          release: '2009-12-25', language: 'Hindi',      poster: 'https://m.media-amazon.com/images/M/MV5BNTkyOGVjMGEtNmQzZi00NzFlLTlhOWQtODYyMDc2ZGJmYzFhXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg',             genre: 'Comedy'     },
  { id: 11, title: 'Lagaan',                            release: '2001-06-15', language: 'Hindi',      poster: 'https://m.media-amazon.com/images/M/MV5BNTcwMjMyNDgtNmI5My00ZmI4LTllNzgtNmI2NTZhMDQ0NTM5XkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg',             genre: 'Sports'     },
  { id: 12, title: 'Bajrangi Bhaijaan',                 release: '2015-07-17', language: 'Hindi',      poster: 'https://m.media-amazon.com/images/M/MV5BNzAzMGQ3NTktNjVjNS00MzEwLTkxNTItNWE3MmFlM2YzOTFjXkEyXkFqcGdeQXVyMTY5NjM2NTQ@._V1_SX300.jpg',             genre: 'Drama'      },
  { id: 13, title: 'Sholay',                            release: '1975-08-15', language: 'Hindi',      poster: 'https://m.media-amazon.com/images/M/MV5BOTI1NDkxMjc4Nl5BMl5BanBnXkFtZTcwMjgwOTk0Mw@@._V1_SX300.jpg',                                             genre: 'Action'     },
  { id: 14, title: 'Dil Chahta Hai',                    release: '2001-08-10', language: 'Hindi',      poster: 'https://m.media-amazon.com/images/M/MV5BNmI1MDFjZjktMTI4Mi00NzQ3LWI1NjMtNjRkMDRhNjNiMTVlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg',             genre: 'Comedy'     },
  // Kannada
  { id: 15, title: 'KGF: Chapter 1',                   release: '2018-12-21', language: 'Kannada',    poster: 'https://m.media-amazon.com/images/M/MV5BOWY4MmFiY2QtMzE1YS00NTg1LWIwOTQtYTI4ZGUzNWIxNTVmXkEyXkFqcGdeQXVyODEzNjM5OTQ@._V1_SX300.jpg',             genre: 'Action'     },
  { id: 16, title: 'KGF: Chapter 2',                   release: '2022-04-14', language: 'Kannada',    poster: 'https://m.media-amazon.com/images/M/MV5BZGRjNTMwYjYtOTkxYy00ZGZhLWJhNTMtYTA3ZjI1YWZjMDA2XkEyXkFqcGdeQXVyMTUyNjIwMDEw._V1_SX300.jpg',             genre: 'Action'     },
  { id: 17, title: 'Kantara',                           release: '2022-09-30', language: 'Kannada',    poster: 'https://m.media-amazon.com/images/M/MV5BOTE5ZmRkYWQtNzJhMi00YTFiLTg1MWQtZjcxYTQ5MmQ3ZWQ2XkEyXkFqcGdeQXVyMTUyNjIwMDEw._V1_SX300.jpg',             genre: 'Thriller'   },
  { id: 18, title: 'Mungaru Male',                      release: '2006-10-27', language: 'Kannada',    poster: 'https://m.media-amazon.com/images/M/MV5BMGE4OTMyYWQtMzJkZC00Y2Q1LTkzMGYtOTA4ZGY3YWFlNjRhXkEyXkFqcGdeQXVyNjQ2MjQ5NzM@._V1_SX300.jpg',             genre: 'Romance'    },
  { id: 19, title: 'Ulidavaru Kandante',                release: '2014-07-18', language: 'Kannada',    poster: 'https://m.media-amazon.com/images/M/MV5BMTY3OTg2OTM0NF5BMl5BanBnXkFtZTgwMjc3OTAyMjE@._V1_SX300.jpg',                                             genre: 'Crime'      },
  { id: 20, title: 'Aa Dinagalu',                       release: '2007-11-23', language: 'Kannada',    poster: 'https://m.media-amazon.com/images/M/MV5BMjI1MDM1NTg4NF5BMl5BanBnXkFtZTcwNTQ1OTMzMQ@@._V1_SX300.jpg',                                             genre: 'Action'     },
  { id: 21, title: 'Tagaru',                            release: '2018-01-12', language: 'Kannada',    poster: 'https://m.media-amazon.com/images/M/MV5BYjBhMGRhMTMtZDE3ZS00MmJiLTgxYTItNjk2NjFiNjEzM2M4XkEyXkFqcGdeQXVyODE5NzE3OTE@._V1_SX300.jpg',             genre: 'Action'     },
  { id: 22, title: 'Raajakumara',                       release: '2017-04-28', language: 'Kannada',    poster: 'https://m.media-amazon.com/images/M/MV5BNWNlMTQwMTgtYzc5Yi00ZjEwLWFkMGUtMmU5NTQyNmFhNTBhXkEyXkFqcGdeQXVyNjc1NTYyMjg@._V1_SX300.jpg',             genre: 'Action'     },
  // Telugu
  { id: 23, title: 'RRR',                               release: '2022-03-24', language: 'Telugu',     poster: 'https://m.media-amazon.com/images/M/MV5BODUwNDNjYzctODUxNDMtMzVhNC00ZDIzLWE3YmMtMGYwZThlZTkxMDFkXkEyXkFqcGdeQXVyMTA3MTI2ODc5._V1_SX300.jpg',      genre: 'Action'     },
  { id: 24, title: 'Baahubali: The Beginning',          release: '2015-07-10', language: 'Telugu',     poster: 'https://m.media-amazon.com/images/M/MV5BYWVlMjVkZWQtZTQ3MC00OGQ3LWI2YzktOGNmMWJhOWZmZjA1XkEyXkFqcGdeQXVyODIwMDI1NjM@._V1_SX300.jpg',               genre: 'Action'     },
  { id: 25, title: 'Baahubali 2: The Conclusion',       release: '2017-04-28', language: 'Telugu',     poster: 'https://m.media-amazon.com/images/M/MV5BMjQzNzEzMjQxN15BMl5BanBnXkFtZTgwMjQzNzEzMjQ@._V1_SX300.jpg',                                               genre: 'Action'     },
  { id: 26, title: 'Ala Vaikunthapurramuloo',           release: '2020-01-12', language: 'Telugu',     poster: 'https://m.media-amazon.com/images/M/MV5BOGZhMzgwMGItNTIwZS00NDNjLWIxZTMtMTA4ZjFkNjY4NmEwXkEyXkFqcGdeQXVyMTIzMDI3NDkz._V1_SX300.jpg',              genre: 'Comedy'     },
  // Tamil
  { id: 27, title: 'Vikram',                            release: '2022-06-03', language: 'Tamil',      poster: 'https://m.media-amazon.com/images/M/MV5BMGNhMTczODMtNGVhZS00YjE5LThkMDEtMmFlOWY5ZjI4MDYzXkEyXkFqcGdeQXVyMTUzNTgzNzM@._V1_SX300.jpg',              genre: 'Action'     },
  { id: 28, title: 'Enthiran',                          release: '2010-10-01', language: 'Tamil',      poster: 'https://m.media-amazon.com/images/M/MV5BNjY1MDg0NjQxNV5BMl5BanBnXkFtZTcwMTMxNTc5Mw@@._V1_SX300.jpg',                                               genre: 'Sci-Fi'     },
  { id: 29, title: 'Mersal',                            release: '2017-10-18', language: 'Tamil',      poster: 'https://m.media-amazon.com/images/M/MV5BN2IwYzhmODEtZDNjMC00NDA1LWIzMzMtZjU3YjY4NzJiNDQ1XkEyXkFqcGdeQXVyODIwMDI1NjM@._V1_SX300.jpg',              genre: 'Thriller'   },
  { id: 30, title: 'Kabali',                            release: '2016-07-22', language: 'Tamil',      poster: 'https://m.media-amazon.com/images/M/MV5BNmVlMmIxNTYtMzEyMi00MTUyLTgwMmQtMzAzZTI5MzY1YjM4XkEyXkFqcGdeQXVyODIwMDI1NjM@._V1_SX300.jpg',              genre: 'Action'     },
  { id: 31, title: 'Kaithi',                            release: '2019-10-25', language: 'Tamil',      poster: 'https://m.media-amazon.com/images/M/MV5BYTEwNDRiMjYtMzlkNi00NGI4LTg4ZGQtZDQ5YTUxOTc2NGY0XkEyXkFqcGdeQXVyODY3Njc5NzY@._V1_SX300.jpg',              genre: 'Thriller'   },
  // Malayalam
  { id: 32, title: 'Drishyam',                          release: '2013-08-30', language: 'Malayalam',  poster: 'https://m.media-amazon.com/images/M/MV5BNGMzNGY5NzMtNTU0My00NmI2LTkxMzItOTkwMjQ3ZjZjOTA4XkEyXkFqcGdeQXVyMTkxNjUyNQ@@._V1_SX300.jpg',              genre: 'Thriller'   },
  { id: 33, title: 'Lucifer',                           release: '2019-03-28', language: 'Malayalam',  poster: 'https://m.media-amazon.com/images/M/MV5BNmYxOGE0NjYtODQzYy00NTkyLWFkMzktZDkxOWJkZmRhNTRjXkEyXkFqcGdeQXVyMTkxNjUyNQ@@._V1_SX300.jpg',              genre: 'Action'     },
  { id: 34, title: 'Premam',                            release: '2015-05-29', language: 'Malayalam',  poster: 'https://m.media-amazon.com/images/M/MV5BMjE0NzYzMzEzOV5BMl5BanBnXkFtZTgwNzU4MTg3NTE@._V1_SX300.jpg',                                               genre: 'Romance'    },
  { id: 35, title: 'Joseph',                            release: '2018-10-05', language: 'Malayalam',  poster: 'https://m.media-amazon.com/images/M/MV5BMjQ5NTk4NTgxNV5BMl5BanBnXkFtZTgwOTE5NzY3NjM@._V1_SX300.jpg',                                               genre: 'Drama'      },
  // Korean
  { id: 36, title: 'Parasite',                          release: '2019-05-30', language: 'Korean',     poster: 'https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_SX300.jpg',             genre: 'Thriller'   },
  { id: 37, title: 'Oldboy',                            release: '2003-11-21', language: 'Korean',     poster: 'https://m.media-amazon.com/images/M/MV5BMTI3NTQyMzU5M15BMl5BanBnXkFtZTcwMTM2MjgyMQ@@._V1_SX300.jpg',                                               genre: 'Thriller'   },
  { id: 38, title: 'Train to Busan',                    release: '2016-07-20', language: 'Korean',     poster: 'https://m.media-amazon.com/images/M/MV5BMTkxNzI3ODI4Nl5BMl5BanBnXkFtZTgwNDE1OTA1OTE@._V1_SX300.jpg',                                               genre: 'Horror'     },
  // Japanese
  { id: 39, title: 'Spirited Away',                     release: '2001-07-20', language: 'Japanese',   poster: 'https://m.media-amazon.com/images/M/MV5BMjlmZmI5MDctNDE2YS00YWE0LWE5ZWItZDBhYWQ0NTcxNTEhXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg',             genre: 'Animation'  },
  { id: 40, title: 'Your Name',                         release: '2016-08-26', language: 'Japanese',   poster: 'https://m.media-amazon.com/images/M/MV5BODRmZDVmNzUtZjU4Ni00NTljLTgwZTUtYjMyZjllZDU0YWY5XkEyXkFqcGdeQXVyNTk0MzMzODA@._V1_SX300.jpg',             genre: 'Animation'  },
  { id: 41, title: 'Akira',                             release: '1988-07-16', language: 'Japanese',   poster: 'https://m.media-amazon.com/images/M/MV5BM2ZiZTk1ODgtMTZkNS00NTYxLWb3ZjQtZGM5N2JhNzAzN2QyXkEyXkFqcGdeQXVyMTE4MDkxNjc@._V1_SX300.jpg',             genre: 'Animation'  },
  // Spanish
  { id: 42, title: "Pan's Labyrinth",                   release: '2006-10-11', language: 'Spanish',    poster: 'https://m.media-amazon.com/images/M/MV5BMjEwMzgwODkwN15BMl5BanBnXkFtZTcwNDAwNjQ1MQ@@._V1_SX300.jpg',                                               genre: 'Fantasy'    },
  { id: 43, title: 'The Secret in Their Eyes',          release: '2009-08-13', language: 'Spanish',    poster: 'https://m.media-amazon.com/images/M/MV5BMTQ3NjkxMDYyNF5BMl5BanBnXkFtZTcwODgxMzA4Mg@@._V1_SX300.jpg',                                               genre: 'Thriller'   },
  // French
  { id: 44, title: 'Amélie',                            release: '2001-04-25', language: 'French',     poster: 'https://m.media-amazon.com/images/M/MV5BNDg4NjM1YjMtYmNhZC00MjM0LWFiZmYtNGY1YjAwNTg0NzlzXkEyXkFqcGdeQXVyMTA0MTM5NjI2._V1_SX300.jpg',             genre: 'Comedy'     },
  { id: 45, title: 'The Intouchables',                  release: '2011-11-02', language: 'French',     poster: 'https://m.media-amazon.com/images/M/MV5BMTYxNDA3MDQwN15BMl5BanBnXkFtZTcwNTU4Mzc1Nw@@._V1_SX300.jpg',                                               genre: 'Drama'      },
  // Portuguese
  { id: 46, title: 'City of God',                       release: '2002-08-30', language: 'Portuguese', poster: 'https://m.media-amazon.com/images/M/MV5BOTMwYjc5ZmItYTFjZC00ZGQ3LTlkNTMtMjZiNTZlMWQzNzI5XkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg',             genre: 'Crime'      },
  // Italian
  { id: 47, title: 'Life Is Beautiful',                 release: '1997-12-20', language: 'Italian',    poster: 'https://m.media-amazon.com/images/M/MV5BYjJiZTNkZWQtYTMyNS00MWQ5LWJhNmEtZmM0YWUyMjUzMDgyXkEyXkFqcGdeQXVyMTAwMzUyMzUy._V1_SX300.jpg',             genre: 'Drama'      },
  { id: 48, title: 'Cinema Paradiso',                   release: '1988-11-17', language: 'Italian',    poster: 'https://m.media-amazon.com/images/M/MV5BM2ZmZDZiMzktNTE3MC00OGMyLTk0NTktZWQ0ZjQ3YmM0YzhlXkEyXkFqcGdeQXVyMTAwMzUyMzUy._V1_SX300.jpg',             genre: 'Drama'      },
  // Bengali
  { id: 49, title: 'Pather Panchali',                   release: '1955-05-26', language: 'Bengali',    poster: 'https://m.media-amazon.com/images/M/MV5BZmI5ZjgwYmYtZmQ5YS00ZmY4LWI1ZWItYjk4YmNiZmZhODhlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg',             genre: 'Drama'      },
  // Chinese
  { id: 50, title: 'Crouching Tiger, Hidden Dragon',    release: '2000-12-22', language: 'Chinese',    poster: 'https://m.media-amazon.com/images/M/MV5BOGIwMjdjMTYtNmZjOS00NzU4LTgyMWQtMGE2NjI5ZDNkMmRlXkEyXkFqcGdeQXVyNTAyODkwOQ@@._V1_SX300.jpg',             genre: 'Action'     },
  // Marathi
  { id: 51, title: 'Sairat',                            release: '2016-04-29', language: 'Marathi',    poster: 'https://m.media-amazon.com/images/M/MV5BMjMzMDczNDcwNF5BMl5BanBnXkFtZTgwMjUwMzk2OTE@._V1_SX300.jpg',                                               genre: 'Romance'    },
  // Gujarati
  { id: 52, title: 'Chhello Divas',                     release: '2015-12-25', language: 'Gujarati',   poster: 'https://m.media-amazon.com/images/M/MV5BMjEzOTMwNzc2OV5BMl5BanBnXkFtZTgwMzk1NTM3NTE@._V1_SX300.jpg',                                               genre: 'Comedy'     },
  // Punjabi
  { id: 53, title: 'Angrej',                            release: '2015-08-14', language: 'Punjabi',    poster: 'https://m.media-amazon.com/images/M/MV5BOWQ3OWUyNDItOTNhYy00N2U2LWEzN2YtYWZkMTJlMjc0NjU0XkEyXkFqcGdeQXVyMjMyMDA2Mg@@._V1_SX300.jpg',             genre: 'Romance'    },
  // Odia
  { id: 54, title: 'Daman',                             release: '2001-03-23', language: 'Odia',       poster: 'https://m.media-amazon.com/images/M/MV5BOGM1ZmMxM2EtMGJhMC00ZDJhLThlYjMtNzg0MDZiMTQzYWIwXkEyXkFqcGdeQXVyMjgyNDU4MDE@._V1_SX300.jpg',             genre: 'Drama'      },
  // German
  { id: 55, title: 'Das Boot',                          release: '1981-09-17', language: 'German',     poster: 'https://m.media-amazon.com/images/M/MV5BNTk5MzE1ZDItMzQwYi00YjBmLTg0OWQtMjIyNGY3YzllNmRhXkEyXkFqcGdeQXVyMjUzOTY1NTc@._V1_SX300.jpg',             genre: 'Drama'      },
];

const LANGUAGES = [
  'All', 'English', 'Hindi', 'Kannada', 'Telugu', 'Tamil', 'Malayalam',
  'Korean', 'Japanese', 'Spanish', 'French', 'Portuguese', 'Italian',
  'Bengali', 'Chinese', 'Marathi', 'Gujarati', 'Punjabi', 'Odia', 'German'
];

const GENRES = ['All', 'Action', 'Sci-Fi', 'Thriller', 'Sports', 'Animation', 'Fantasy', 'Crime', 'Comedy', 'Drama', 'Romance', 'Horror'];

export default function Explore() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedLang, setSelectedLang] = useState('All');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [likedMovies, setLikedMovies] = useState<number[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('cinesense_likes');
    if (saved) {
      try { setLikedMovies(JSON.parse(saved)); } catch { /* ignore */ }
    }
  }, []);

  // Close suggestion dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Live autocomplete suggestions – search across ALL movies ignoring language/genre filters
  const suggestions = search.trim().length > 0
    ? MOVIES.filter(m => m.title.toLowerCase().includes(search.toLowerCase())).slice(0, 8)
    : [];

  const toggleLike = (id: number, title: string) => {
    setLikedMovies(prev => {
      const isLiked = prev.includes(id);
      const next = isLiked ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem('cinesense_likes', JSON.stringify(next));
      if (!isLiked) toast.success(`Liked ${title}!`);
      return next;
    });
  };

  const filteredMovies = MOVIES.filter(movie => {
    const matchesSearch = movie.title.toLowerCase().includes(search.toLowerCase());
    const matchesLang = selectedLang === 'All' || movie.language === selectedLang;
    const matchesGenre = selectedGenre === 'All' || movie.genre === selectedGenre;
    return matchesSearch && matchesLang && matchesGenre;
  });

  const handleSuggestionClick = (movie: typeof MOVIES[0]) => {
    setSearch(movie.title);
    setShowSuggestions(false);
    setSelectedLang('All');
    setSelectedGenre('All');
  };

  return (
    <main className="pt-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col md:flex-row gap-8">

        {/* ── Sidebar Filters ── */}
        <aside className="w-full md:w-64 flex-shrink-0 space-y-6">
          <div className={cn('rounded-xl border p-5', isDark ? 'bg-[#1a1a25] border-[#2a2a3d]' : 'bg-white border-slate-200')}>
            <h2 className={cn('font-semibold text-lg flex items-center gap-2 mb-4', isDark ? 'text-white' : 'text-slate-900')}>
              <Filter size={18} className="text-purple-400" /> Filters
            </h2>
            <div className="space-y-5">
              {/* Language */}
              <div>
                <label className={cn('text-xs font-medium mb-1.5 block', isDark ? 'text-slate-400' : 'text-slate-500')}>Language</label>
                <select
                  value={selectedLang}
                  onChange={e => setSelectedLang(e.target.value)}
                  className={cn('w-full rounded-lg border text-sm py-2 px-3 outline-none cursor-pointer',
                    isDark ? 'bg-[#16161f] border-[#2a2a3d] text-white' : 'bg-slate-50 border-slate-200 text-slate-800')}
                >
                  {LANGUAGES.map(lang => <option key={lang} value={lang}>{lang}</option>)}
                </select>
              </div>
              {/* Genre */}
              <div>
                <label className={cn('text-xs font-medium mb-1.5 block', isDark ? 'text-slate-400' : 'text-slate-500')}>Genre</label>
                <select
                  value={selectedGenre}
                  onChange={e => setSelectedGenre(e.target.value)}
                  className={cn('w-full rounded-lg border text-sm py-2 px-3 outline-none cursor-pointer',
                    isDark ? 'bg-[#16161f] border-[#2a2a3d] text-white' : 'bg-slate-50 border-slate-200 text-slate-800')}
                >
                  {GENRES.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
              {/* Reset */}
              {(selectedLang !== 'All' || selectedGenre !== 'All' || search) && (
                <button
                  onClick={() => { setSelectedLang('All'); setSelectedGenre('All'); setSearch(''); }}
                  className="w-full text-xs font-medium text-purple-400 hover:text-purple-300 py-1.5 border border-purple-500/30 rounded-lg hover:bg-purple-500/10 transition-colors"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          </div>
        </aside>

        {/* ── Main content ── */}
        <section className="flex-1 min-w-0">
          {/* Top bar: title + search */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
            <h1 className={cn('font-display text-2xl font-bold whitespace-nowrap', isDark ? 'text-white' : 'text-slate-900')}>
              Popular Movies
            </h1>

            {/* ── Search with autocomplete ── */}
            <div ref={searchRef} className="relative flex-1">
              <Search size={15} className={cn('absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none', isDark ? 'text-slate-500' : 'text-slate-400')} />
              <input
                type="text"
                value={search}
                onChange={e => { setSearch(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Search movies across all languages..."
                className={cn(
                  'w-full rounded-xl border text-sm py-2.5 pl-9 pr-9 transition-colors outline-none ring-0 focus:ring-2 focus:ring-purple-500/30',
                  isDark
                    ? 'bg-[#1a1a25] border-[#2a2a3d] text-white placeholder:text-slate-600 focus:border-purple-500/50'
                    : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-purple-500/50'
                )}
              />
              {search && (
                <button
                  onClick={() => { setSearch(''); setShowSuggestions(false); }}
                  className={cn('absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity', isDark ? 'text-slate-500' : 'text-slate-400')}
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}

              {/* Autocomplete dropdown */}
              <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                  <motion.ul
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.15 }}
                    className={cn(
                      'absolute z-50 w-full mt-2 rounded-xl border shadow-2xl overflow-hidden',
                      isDark ? 'bg-[#1a1a25] border-[#2a2a3d]' : 'bg-white border-slate-200'
                    )}
                  >
                    {suggestions.map(movie => (
                      <li key={movie.id}>
                        <button
                          onMouseDown={() => handleSuggestionClick(movie)}
                          className={cn(
                            'w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors',
                            isDark ? 'hover:bg-white/5 text-slate-200' : 'hover:bg-slate-50 text-slate-800'
                          )}
                        >
                          <img
                            src={movie.poster}
                            alt={movie.title}
                            className="w-8 h-12 object-cover rounded flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{movie.title}</div>
                            <div className="flex gap-2 mt-0.5">
                              <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full font-semibold', isDark ? 'bg-purple-500/15 text-purple-300' : 'bg-purple-50 text-purple-600')}>
                                {movie.language}
                              </span>
                              <span className={cn('text-[10px]', isDark ? 'text-slate-500' : 'text-slate-400')}>
                                {movie.genre} · {new Date(movie.release).getFullYear()}
                              </span>
                            </div>
                          </div>
                        </button>
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>

            <span className={cn('text-sm font-medium px-3 py-1.5 rounded-full border whitespace-nowrap', isDark ? 'bg-[#1a1a25] border-[#2a2a3d] text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600')}>
              {filteredMovies.length} results
            </span>
          </div>

          {/* Movie grid */}
          {filteredMovies.length === 0 ? (
            <div className={cn('rounded-xl border p-12 text-center border-dashed', isDark ? 'border-[#2a2a3d] bg-[#1a1a25]/50' : 'border-slate-200 bg-slate-50/50')}>
              <Film size={48} className={cn('mx-auto mb-4 opacity-30', isDark ? 'text-slate-500' : 'text-slate-400')} />
              <h3 className={cn('text-lg font-medium mb-2', isDark ? 'text-slate-300' : 'text-slate-700')}>No movies found</h3>
              <p className={isDark ? 'text-slate-500' : 'text-slate-500'}>Try adjusting your filters or search term.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-5">
              <AnimatePresence>
                {filteredMovies.map(movie => {
                  const isLiked = likedMovies.includes(movie.id);
                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.92 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.92 }}
                      transition={{ duration: 0.2 }}
                      key={movie.id}
                      className={cn(
                        'group rounded-xl border overflow-hidden flex flex-col relative hover:shadow-xl transition-shadow',
                        isDark ? 'bg-[#1a1a25] border-[#2a2a3d]' : 'bg-white border-slate-200 shadow-sm'
                      )}
                    >
                      {/* Like button */}
                      <button
                        onClick={() => toggleLike(movie.id, movie.title)}
                        className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center transition-transform hover:scale-110 active:scale-95"
                        aria-label={isLiked ? 'Unlike' : 'Like'}
                      >
                        <Heart size={15} className={isLiked ? 'fill-red-500 text-red-500' : 'text-white'} />
                      </button>

                      {/* Poster */}
                      <div className="aspect-[2/3] w-full overflow-hidden bg-slate-800">
                        <img
                          src={movie.poster}
                          alt={movie.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                          onError={e => {
                            (e.target as HTMLImageElement).src = `https://placehold.co/300x450/1a1a25/7c3aed?text=${encodeURIComponent(movie.title)}`;
                          }}
                        />
                      </div>

                      {/* Info */}
                      <div className="p-3 flex flex-col flex-1">
                        <h3 className={cn('font-bold text-sm leading-tight mb-1 line-clamp-1', isDark ? 'text-white' : 'text-slate-900')} title={movie.title}>
                          {movie.title}
                        </h3>
                        <p className={cn('text-[11px] flex items-center gap-1 mb-3', isDark ? 'text-slate-500' : 'text-slate-400')}>
                          <Calendar size={11} /> {new Date(movie.release).getFullYear()}
                        </p>
                        <div className="flex flex-wrap gap-1.5 mb-3 mt-auto">
                          <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full border', isDark ? 'bg-purple-500/10 border-purple-500/20 text-purple-300' : 'bg-purple-50 border-purple-200 text-purple-700')}>
                            {movie.language}
                          </span>
                          <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full border', isDark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-600')}>
                            {movie.genre}
                          </span>
                        </div>
                        <button
                          onClick={() => navigate('/analyzer', { state: { defaultMovie: movie.title } })}
                          className="w-full btn-primary py-1.5 text-xs font-semibold"
                        >
                          Write a Review
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
