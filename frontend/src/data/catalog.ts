export interface CatalogItem {
  id: number;
  title: string;
  release: string;
  language: string;
  genre: string;
  type: 'movie' | 'series';
  poster: string;
  tmdbId: number;
}

export const CATALOG: CatalogItem[] = [
  {
    "id": 1,
    "title": "Inception",
    "release": "2010-07-16",
    "language": "English",
    "genre": "Sci-Fi",
    "poster": "https://image.tmdb.org/t/p/w500/xlaY2zyzMfkhk0HSC5VUwzoZPU1.jpg",
    "tmdbId": 27205,
    "type": "movie"
  },
  {
    "id": 2,
    "title": "Interstellar",
    "release": "2014-11-05",
    "language": "English",
    "genre": "Sci-Fi",
    "poster": "https://image.tmdb.org/t/p/w500/yQvGrMoipbRoddT0ZR8tPoR7NfX.jpg",
    "tmdbId": 157336,
    "type": "movie"
  },
  {
    "id": 3,
    "title": "The Dark Knight",
    "release": "2008-07-18",
    "language": "English",
    "genre": "Action",
    "poster": "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
    "tmdbId": 155,
    "type": "movie"
  },
  {
    "id": 4,
    "title": "The Shawshank Redemption",
    "release": "1994-09-23",
    "language": "English",
    "genre": "Drama",
    "poster": "https://image.tmdb.org/t/p/w500/9cqNxx0GxF0bflZmeSMuL5tnGzr.jpg",
    "tmdbId": 278,
    "type": "movie"
  },
  {
    "id": 5,
    "title": "Spider-Man: Across the Spider-Verse",
    "release": "2023-06-02",
    "language": "English",
    "genre": "Animation",
    "poster": "https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg",
    "tmdbId": 569094,
    "type": "movie"
  },
  {
    "id": 6,
    "title": "The Godfather",
    "release": "1972-03-24",
    "language": "English",
    "genre": "Crime",
    "poster": "https://image.tmdb.org/t/p/w500/3bhkrj58Vtu7enYsRolD1fZdja1.jpg",
    "tmdbId": 238,
    "type": "movie"
  },
  {
    "id": 7,
    "title": "Avengers: Endgame",
    "release": "2019-04-26",
    "language": "English",
    "genre": "Action",
    "poster": "https://image.tmdb.org/t/p/w500/bR8ISy1O9XQxqiy0fQFw2BX72RQ.jpg",
    "tmdbId": 299534,
    "type": "movie"
  },
  {
    "id": 8,
    "title": "Forrest Gump",
    "release": "1994-07-06",
    "language": "English",
    "genre": "Drama",
    "poster": "https://image.tmdb.org/t/p/w500/saHP97rTPS5eLmrLQEcANmKrsFl.jpg",
    "tmdbId": 13,
    "type": "movie"
  },
  {
    "id": 9,
    "title": "Dangal",
    "release": "2016-12-21",
    "language": "Hindi",
    "genre": "Sports",
    "poster": "https://image.tmdb.org/t/p/w500/cJRPOLEexI7qp2DKtFfCh7YaaUG.jpg",
    "tmdbId": 360814,
    "type": "movie"
  },
  {
    "id": 10,
    "title": "3 Idiots",
    "release": "2009-12-25",
    "language": "Hindi",
    "genre": "Comedy",
    "poster": "https://image.tmdb.org/t/p/w500/66A9MqXOyVFCssoloscw79z8Tew.jpg",
    "tmdbId": 20453,
    "type": "movie"
  },
  {
    "id": 11,
    "title": "Lagaan",
    "release": "2001-06-15",
    "language": "Hindi",
    "genre": "Sports",
    "poster": "https://image.tmdb.org/t/p/w500/yNX9lFRAFeNLNRIXdqZK9gYrYKa.jpg",
    "tmdbId": 19666,
    "type": "movie"
  },
  {
    "id": 12,
    "title": "Bajrangi Bhaijaan",
    "release": "2015-07-17",
    "language": "Hindi",
    "genre": "Drama",
    "poster": "https://image.tmdb.org/t/p/w500/vhlliI7HZZlWfo5d6CiyfBAGLrW.jpg",
    "tmdbId": 348892,
    "type": "movie"
  },
  {
    "id": 13,
    "title": "Sholay",
    "release": "1975-08-15",
    "language": "Hindi",
    "genre": "Action",
    "poster": "https://image.tmdb.org/t/p/w500/ya9bwgqA4eNl5bQ9QqS0jcmRoBS.jpg",
    "tmdbId": 12259,
    "type": "movie"
  },
  {
    "id": 14,
    "title": "Dil Chahta Hai",
    "release": "2001-08-10",
    "language": "Hindi",
    "genre": "Comedy",
    "poster": "https://image.tmdb.org/t/p/w500/d5yjk7hbv8AK0DR0oJUrSGHMn9A.jpg",
    "tmdbId": 14752,
    "type": "movie"
  },
  {
    "id": 15,
    "title": "KGF: Chapter 1",
    "release": "2018-12-21",
    "language": "Kannada",
    "genre": "Action",
    "poster": "https://image.tmdb.org/t/p/w500/ltHlJwvxKv7d0ooCiKSAvfwV9tX.jpg",
    "tmdbId": 564147,
    "type": "movie"
  },
  {
    "id": 16,
    "title": "KGF: Chapter 2",
    "release": "2022-04-14",
    "language": "Kannada",
    "genre": "Action",
    "poster": "https://image.tmdb.org/t/p/w500/khNVygolU0TxLIDWff5tQlAhZ23.jpg",
    "tmdbId": 587412,
    "type": "movie"
  },
  {
    "id": 17,
    "title": "Kantara",
    "release": "2022-09-30",
    "language": "Kannada",
    "genre": "Thriller",
    "poster": "https://image.tmdb.org/t/p/w500/jIsKmkxMzdCZ0Ux1GVSnu8m6Na6.jpg",
    "tmdbId": 858485,
    "type": "movie"
  },
  {
    "id": 18,
    "title": "Mungaru Male",
    "release": "2006-10-27",
    "language": "Kannada",
    "genre": "Romance",
    "poster": "https://image.tmdb.org/t/p/w500/gFXxeSL3fSmb3G2jmhx4kTFRpYd.jpg",
    "tmdbId": 39095,
    "type": "movie"
  },
  {
    "id": 19,
    "title": "Ulidavaru Kandante",
    "release": "2014-07-18",
    "language": "Kannada",
    "genre": "Crime",
    "poster": "https://image.tmdb.org/t/p/w500/b7Ee4DKKhNVYNV84rovdqcWXjgt.jpg",
    "tmdbId": 262476,
    "type": "movie"
  },
  {
    "id": 20,
    "title": "Aa Dinagalu",
    "release": "2007-11-23",
    "language": "Kannada",
    "genre": "Action",
    "poster": "https://image.tmdb.org/t/p/w500/uelniNM3QoYjgg4SLemAImqtd6E.jpg",
    "tmdbId": 81239,
    "type": "movie"
  },
  {
    "id": 21,
    "title": "Tagaru",
    "release": "2018-01-12",
    "language": "Kannada",
    "genre": "Action",
    "poster": "https://image.tmdb.org/t/p/w500/7IMOEfZ4QBFSo2Udi5DvVbyCDBq.jpg",
    "tmdbId": 510568,
    "type": "movie"
  },
  {
    "id": 22,
    "title": "Raajakumara",
    "release": "2017-04-28",
    "language": "Kannada",
    "genre": "Action",
    "poster": "https://image.tmdb.org/t/p/w500/lbpETE00BtXQ3LVoYlamrfsTEnF.jpg",
    "tmdbId": 454113,
    "type": "movie"
  },
  {
    "id": 23,
    "title": "RRR",
    "release": "2022-03-24",
    "language": "Telugu",
    "genre": "Action",
    "poster": "https://image.tmdb.org/t/p/w500/wE0I6efAW4cDDmZQWtwZMOW44EJ.jpg",
    "tmdbId": 579974,
    "type": "movie"
  },
  {
    "id": 24,
    "title": "Baahubali: The Beginning",
    "release": "2015-07-10",
    "language": "Telugu",
    "genre": "Action",
    "poster": "https://image.tmdb.org/t/p/w500/9BAjt8nSSms62uOVYn1t3C3dVto.jpg",
    "tmdbId": 256040,
    "type": "movie"
  },
  {
    "id": 25,
    "title": "Baahubali 2: The Conclusion",
    "release": "2017-04-28",
    "language": "Telugu",
    "genre": "Action",
    "poster": "https://image.tmdb.org/t/p/w500/21sC2assImQIYCEDA84Qh9d1RsK.jpg",
    "tmdbId": 350312,
    "type": "movie"
  },
  {
    "id": 26,
    "title": "Ala Vaikunthapurramuloo",
    "release": "2020-01-12",
    "language": "Telugu",
    "genre": "Comedy",
    "poster": "https://image.tmdb.org/t/p/w500/2rzORJaegE2bbKNVkQXbZCeV0BP.jpg",
    "tmdbId": 628241,
    "type": "movie"
  },
  {
    "id": 27,
    "title": "Vikram",
    "release": "2022-06-03",
    "language": "Tamil",
    "genre": "Action",
    "poster": "https://image.tmdb.org/t/p/w500/774UV1aCURb4s4JfEFg3IEMu5Zj.jpg",
    "tmdbId": 743563,
    "type": "movie"
  },
  {
    "id": 28,
    "title": "Enthiran",
    "release": "2010-10-01",
    "language": "Tamil",
    "genre": "Sci-Fi",
    "poster": "https://image.tmdb.org/t/p/w500/hai6CSCLxULO1RThjDP3lWAqOtQ.jpg",
    "tmdbId": 148284,
    "type": "movie"
  },
  {
    "id": 29,
    "title": "Mersal",
    "release": "2017-10-18",
    "language": "Tamil",
    "genre": "Thriller",
    "poster": "https://image.tmdb.org/t/p/w500/65Q1wpRPZ5E3UVUv2V5JBbJQCcj.jpg",
    "tmdbId": 456287,
    "type": "movie"
  },
  {
    "id": 30,
    "title": "Kabali",
    "release": "2016-07-22",
    "language": "Tamil",
    "genre": "Action",
    "poster": "https://image.tmdb.org/t/p/w500/va0M1xhP3sUUERWfHeSKGVhtJHW.jpg",
    "tmdbId": 366080,
    "type": "movie"
  },
  {
    "id": 31,
    "title": "Kaithi",
    "release": "2019-10-25",
    "language": "Tamil",
    "genre": "Thriller",
    "poster": "https://image.tmdb.org/t/p/w500/hOF9CgPsy9aLr5GJEBESC8MEXFy.jpg",
    "tmdbId": 587030,
    "type": "movie"
  },
  {
    "id": 32,
    "title": "Drishyam",
    "release": "2013-08-30",
    "language": "Malayalam",
    "genre": "Thriller",
    "poster": "https://image.tmdb.org/t/p/w500/67FsF2kpgEZ1T5Qos4adgqm9dLf.jpg",
    "tmdbId": 1269325,
    "type": "movie"
  },
  {
    "id": 33,
    "title": "Lucifer",
    "release": "2019-03-28",
    "language": "Malayalam",
    "genre": "Action",
    "poster": "https://image.tmdb.org/t/p/w500/fXgY2RCzoIJPhPDoyKRjaaqjIZs.jpg",
    "tmdbId": 564701,
    "type": "movie"
  },
  {
    "id": 34,
    "title": "Premam",
    "release": "2015-05-29",
    "language": "Malayalam",
    "genre": "Romance",
    "poster": "https://image.tmdb.org/t/p/w500/wfMgsfDrtouYOM6MbrkHtU96Xij.jpg",
    "tmdbId": 341895,
    "type": "movie"
  },
  {
    "id": 35,
    "title": "Joseph",
    "release": "2018-10-05",
    "language": "Malayalam",
    "genre": "Drama",
    "poster": "https://image.tmdb.org/t/p/w500/lBscKQzEJY1XF2ReZT2vIGrMQ1k.jpg",
    "tmdbId": 2405,
    "type": "movie"
  },
  {
    "id": 36,
    "title": "Parasite",
    "release": "2019-05-30",
    "language": "Korean",
    "genre": "Thriller",
    "poster": "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg",
    "tmdbId": 496243,
    "type": "movie"
  },
  {
    "id": 37,
    "title": "Oldboy",
    "release": "2003-11-21",
    "language": "Korean",
    "genre": "Thriller",
    "poster": "https://image.tmdb.org/t/p/w500/pWDtjs568ZfOTMbURQBYuT4Qxka.jpg",
    "tmdbId": 670,
    "type": "movie"
  },
  {
    "id": 38,
    "title": "Train to Busan",
    "release": "2016-07-20",
    "language": "Korean",
    "genre": "Horror",
    "poster": "https://image.tmdb.org/t/p/w500/vNVFt6dtcqnI7hqa6LFBUibuFiw.jpg",
    "tmdbId": 396535,
    "type": "movie"
  },
  {
    "id": 39,
    "title": "Spirited Away",
    "release": "2001-07-20",
    "language": "Japanese",
    "genre": "Animation",
    "poster": "https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg",
    "tmdbId": 129,
    "type": "movie"
  },
  {
    "id": 40,
    "title": "Your Name",
    "release": "2016-08-26",
    "language": "Japanese",
    "genre": "Animation",
    "poster": "https://image.tmdb.org/t/p/w500/vfJFJPepRKapMd5G2ro7klIRysq.jpg",
    "tmdbId": 372058,
    "type": "movie"
  },
  {
    "id": 41,
    "title": "Akira",
    "release": "1988-07-16",
    "language": "Japanese",
    "genre": "Animation",
    "poster": "https://image.tmdb.org/t/p/w500/neZ0ykEsPqxamsX6o5QNUFILQrz.jpg",
    "tmdbId": 149,
    "type": "movie"
  },
  {
    "id": 42,
    "title": "Pan's Labyrinth",
    "release": "2006-10-11",
    "language": "Spanish",
    "genre": "Fantasy",
    "poster": "https://image.tmdb.org/t/p/w500/7wb2Ldp0oAx1lcZvffq9RfWoI2h.jpg",
    "tmdbId": 1417,
    "type": "movie"
  },
  {
    "id": 43,
    "title": "The Secret in Their Eyes",
    "release": "2009-08-13",
    "language": "Spanish",
    "genre": "Thriller",
    "poster": "https://image.tmdb.org/t/p/w500/dkeAwfZzwL3WvToydE3CXiY80E0.jpg",
    "tmdbId": 25376,
    "type": "movie"
  },
  {
    "id": 44,
    "title": "Amélie",
    "release": "2001-04-25",
    "language": "French",
    "genre": "Comedy",
    "poster": "https://image.tmdb.org/t/p/w500/nSxDa3M9aMvGVLoItzWTepQ5h5d.jpg",
    "tmdbId": 194,
    "type": "movie"
  },
  {
    "id": 45,
    "title": "The Intouchables",
    "release": "2011-11-02",
    "language": "French",
    "genre": "Drama",
    "poster": "https://image.tmdb.org/t/p/w500/1QU7HKgsQbGpzsJbJK4pAVQV9F5.jpg",
    "tmdbId": 77338,
    "type": "movie"
  },
  {
    "id": 46,
    "title": "City of God",
    "release": "2002-08-30",
    "language": "Portuguese",
    "genre": "Crime",
    "poster": "https://image.tmdb.org/t/p/w500/k7eYdWvhYQyRQoU2TB2A2Xu2TfD.jpg",
    "tmdbId": 598,
    "type": "movie"
  },
  {
    "id": 47,
    "title": "Life Is Beautiful",
    "release": "1997-12-20",
    "language": "Italian",
    "genre": "Drama",
    "poster": "https://image.tmdb.org/t/p/w500/74hLDKjD5aGYOotO6esUVaeISa2.jpg",
    "tmdbId": 637,
    "type": "movie"
  },
  {
    "id": 48,
    "title": "Cinema Paradiso",
    "release": "1988-11-17",
    "language": "Italian",
    "genre": "Drama",
    "poster": "https://image.tmdb.org/t/p/w500/9JhfVOveaY00o8njQu2Xrp4YWud.jpg",
    "tmdbId": 11216,
    "type": "movie"
  },
  {
    "id": 49,
    "title": "Pather Panchali",
    "release": "1955-05-26",
    "language": "Bengali",
    "genre": "Drama",
    "poster": "https://image.tmdb.org/t/p/w500/frZj5djlU9hFEjMcL21RJZVuG5O.jpg",
    "tmdbId": 5801,
    "type": "movie"
  },
  {
    "id": 50,
    "title": "Crouching Tiger, Hidden Dragon",
    "release": "2000-12-22",
    "language": "Chinese",
    "genre": "Action",
    "poster": "https://image.tmdb.org/t/p/w500/iNDVBFNz4XyYzM9Lwip6atSTFqf.jpg",
    "tmdbId": 146,
    "type": "movie"
  },
  {
    "id": 51,
    "title": "Sairat",
    "release": "2016-04-29",
    "language": "Marathi",
    "genre": "Romance",
    "poster": "https://image.tmdb.org/t/p/w500/d8K4ZI1RSxMkIIwu5cuvZmzwohq.jpg",
    "tmdbId": 383367,
    "type": "movie"
  },
  {
    "id": 52,
    "title": "Chhello Divas",
    "release": "2015-12-25",
    "language": "Gujarati",
    "genre": "Comedy",
    "poster": "https://image.tmdb.org/t/p/w500/5YLquUOgmKdA7t5WA9q3OGBcfiA.jpg",
    "tmdbId": 369865,
    "type": "movie"
  },
  {
    "id": 53,
    "title": "Angrej",
    "release": "2015-08-14",
    "language": "Punjabi",
    "genre": "Romance",
    "poster": "https://image.tmdb.org/t/p/w500/eukKHm776O4IujOpElzfuzDNhA9.jpg",
    "tmdbId": 352165,
    "type": "movie"
  },
  {
    "id": 54,
    "title": "Daman",
    "release": "2001-03-23",
    "language": "Odia",
    "genre": "Drama",
    "poster": "https://image.tmdb.org/t/p/w500/4CcB3dr3zfo6TlxP2YShOMFiept.jpg",
    "tmdbId": 565696,
    "type": "movie"
  },
  {
    "id": 55,
    "title": "Das Boot",
    "release": "1981-09-17",
    "language": "German",
    "genre": "Drama",
    "poster": "https://image.tmdb.org/t/p/w500/u8FhQPncOAkwcei2OI9orPWhV6K.jpg",
    "tmdbId": 387,
    "type": "movie"
  },
  {
    "id": 101,
    "title": "Breaking Bad",
    "release": "2008-01-20",
    "language": "English",
    "genre": "Crime",
    "type": "series",
    "poster": "https://image.tmdb.org/t/p/w500/anFx9aTOOYqgS3v7x3R84Kz67ly.jpg",
    "tmdbId": 1396
  },
  {
    "id": 102,
    "title": "Stranger Things",
    "release": "2016-07-15",
    "language": "English",
    "genre": "Sci-Fi",
    "type": "series",
    "poster": "https://image.tmdb.org/t/p/w500/uOOtwVbSr4QDjAGIifLDwpb2Pdl.jpg",
    "tmdbId": 66732
  },
  {
    "id": 103,
    "title": "Game of Thrones",
    "release": "2011-04-17",
    "language": "English",
    "genre": "Fantasy",
    "type": "series",
    "poster": "https://image.tmdb.org/t/p/w500/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg",
    "tmdbId": 1399
  },
  {
    "id": 104,
    "title": "Succession",
    "release": "2018-06-03",
    "language": "English",
    "genre": "Drama",
    "type": "series",
    "poster": "https://image.tmdb.org/t/p/w500/z0XiwdrCQ9yVIr4O0pxzaAYRxdW.jpg",
    "tmdbId": 76331
  },
  {
    "id": 105,
    "title": "The Last of Us",
    "release": "2023-01-15",
    "language": "English",
    "genre": "Sci-Fi",
    "type": "series",
    "poster": "https://image.tmdb.org/t/p/w500/dmo6TYuuJgaYinXBPjrgG9mB5od.jpg",
    "tmdbId": 100088
  },
  {
    "id": 106,
    "title": "Peaky Blinders",
    "release": "2013-09-12",
    "language": "English",
    "genre": "Crime",
    "type": "series",
    "poster": "https://image.tmdb.org/t/p/w500/vUUqzWa2LnHIVqkaKVlVGkVcZIW.jpg",
    "tmdbId": 60574
  },
  {
    "id": 107,
    "title": "The Boys",
    "release": "2019-07-26",
    "language": "English",
    "genre": "Action",
    "type": "series",
    "poster": "https://image.tmdb.org/t/p/w500/in1R2dDc421JxsoRWaIIAqVI2KE.jpg",
    "tmdbId": 76479
  },
  {
    "id": 108,
    "title": "Sacred Games",
    "release": "2018-07-06",
    "language": "Hindi",
    "genre": "Crime",
    "type": "series",
    "poster": "https://image.tmdb.org/t/p/w500/uEbNtFbK4At9WBDGap23lt1qO9n.jpg",
    "tmdbId": 79352
  },
  {
    "id": 109,
    "title": "Mirzapur",
    "release": "2018-11-16",
    "language": "Hindi",
    "genre": "Action",
    "type": "series",
    "poster": "https://image.tmdb.org/t/p/w500/1rxLUFVrtTo82OxhbDXJDiJVkwL.jpg",
    "tmdbId": 84105
  },
  {
    "id": 110,
    "title": "The Family Man",
    "release": "2019-09-20",
    "language": "Hindi",
    "genre": "Action",
    "type": "series",
    "poster": "https://image.tmdb.org/t/p/w500/tE1NUJqw9gV6AVjQ1GTK78LbWJ9.jpg",
    "tmdbId": 93352
  },
  {
    "id": 111,
    "title": "Panchayat",
    "release": "2020-04-03",
    "language": "Hindi",
    "genre": "Comedy",
    "type": "series",
    "poster": "https://image.tmdb.org/t/p/w500/xrfvAhrMdT6Uwg5fyTyQAZBYyiu.jpg",
    "tmdbId": 101352
  },
  {
    "id": 112,
    "title": "Paatal Lok",
    "release": "2020-05-15",
    "language": "Hindi",
    "genre": "Crime",
    "type": "series",
    "poster": "https://image.tmdb.org/t/p/w500/xEB6chdsdHFS2RfTXueMVXLWGcl.jpg",
    "tmdbId": 103051
  },
  {
    "id": 113,
    "title": "Scam 1992: The Harshad Mehta Story",
    "release": "2020-10-09",
    "language": "Hindi",
    "genre": "Drama",
    "type": "series",
    "poster": "https://image.tmdb.org/t/p/w500/cBVPwBSVNSVtQocQfyHPFqoIohj.jpg",
    "tmdbId": 111188
  },
  {
    "id": 114,
    "title": "Farzi",
    "release": "2023-02-10",
    "language": "Hindi",
    "genre": "Thriller",
    "type": "series",
    "poster": "https://image.tmdb.org/t/p/w500/cTS86RwEBIDgCgUmjWQTSoPsK6p.jpg",
    "tmdbId": 132117
  },
  {
    "id": 115,
    "title": "Kota Factory",
    "release": "2019-04-16",
    "language": "Hindi",
    "genre": "Drama",
    "type": "series",
    "poster": "https://image.tmdb.org/t/p/w500/fMBookmwL6HjIgIVTjQ6EMr3pCH.jpg",
    "tmdbId": 89113
  },
  {
    "id": 116,
    "title": "Humble Politiciann Nograj",
    "release": "2022-01-06",
    "language": "Kannada",
    "genre": "Comedy",
    "type": "series",
    "poster": "https://image.tmdb.org/t/p/w500/dVXoXpug8GUt7pmMqLaBIGfJe7S.jpg",
    "tmdbId": 155313
  },
  {
    "id": 117,
    "title": "Beast of Bangalore: Indian Predator",
    "release": "2022-12-16",
    "language": "Kannada",
    "genre": "Crime",
    "type": "series",
    "poster": "https://image.tmdb.org/t/p/w500/n6uk2wUZl9DCLQ2NQXQcm6xjRBb.jpg",
    "tmdbId": 215871
  },
  {
    "id": 118,
    "title": "Kyaabre",
    "release": "2021-04-14",
    "language": "Kannada",
    "genre": "Comedy",
    "type": "series",
    "poster": "https://image.tmdb.org/t/p/w500/ovLZWcM6iWGnWZyKK19CS82tn2g.jpg",
    "tmdbId": 122442
  },
  {
    "id": 119,
    "title": "Weekend With Ramesh",
    "release": "2014-08-02",
    "language": "Kannada",
    "genre": "Drama",
    "type": "series",
    "poster": "https://image.tmdb.org/t/p/w500/cGMz2zYiTcDgcZirF9EjiMZmjnY.jpg",
    "tmdbId": 91021
  },
  {
    "id": 120,
    "title": "Gattimela",
    "release": "2019-03-11",
    "language": "Kannada",
    "genre": "Romance",
    "type": "series",
    "poster": "https://image.tmdb.org/t/p/w500/oNmqBNIsRVtqLFQS3nI9Rp19jSh.jpg",
    "tmdbId": 99684
  },
  {
    "id": 121,
    "title": "Kamali",
    "release": "2018-05-28",
    "language": "Kannada",
    "genre": "Drama",
    "type": "series",
    "poster": "https://image.tmdb.org/t/p/w500/5dSvhAyEicQ1QGztv8NyJfMiqaz.jpg",
    "tmdbId": 104262
  },
  {
    "id": 122,
    "title": "Dhootha",
    "release": "2023-12-01",
    "language": "Telugu",
    "genre": "Thriller",
    "type": "series",
    "poster": "https://image.tmdb.org/t/p/w500/jMegWqCj8z58na8RG8ytlPJ7gGm.jpg",
    "tmdbId": 200946
  },
  {
    "id": 123,
    "title": "Rana Naidu",
    "release": "2023-03-10",
    "language": "Telugu",
    "genre": "Action",
    "type": "series",
    "poster": "https://image.tmdb.org/t/p/w500/4kUF7cO76W4vEx70KVfwmju6Vud.jpg",
    "tmdbId": 203202
  },
  {
    "id": 124,
    "title": "Save the Tigers",
    "release": "2023-04-27",
    "language": "Telugu",
    "genre": "Comedy",
    "type": "series",
    "poster": "https://image.tmdb.org/t/p/w500/5uyNd8UjItEU2M5W0YKULaxzWFm.jpg",
    "tmdbId": 224744
  },
  {
    "id": 125,
    "title": "Modern Love Hyderabad",
    "release": "2022-07-08",
    "language": "Telugu",
    "genre": "Romance",
    "type": "series",
    "poster": "https://image.tmdb.org/t/p/w500/t92IeHAebFvYzzw089lemtrqEio.jpg",
    "tmdbId": 200882
  },
  {
    "id": 126,
    "title": "Gaalivaana",
    "release": "2022-04-14",
    "language": "Telugu",
    "genre": "Thriller",
    "type": "series",
    "poster": "https://image.tmdb.org/t/p/w500/5VPrBr7bH4Rb4h0piAc3QKiH0HU.jpg",
    "tmdbId": 195485
  },
  {
    "id": 127,
    "title": "Suzhal - The Vortex",
    "release": "2022-06-17",
    "language": "Tamil",
    "genre": "Thriller",
    "type": "series",
    "poster": "https://image.tmdb.org/t/p/w500/z6IJi7xmAMmKdbzSnwguIXLIVjN.jpg",
    "tmdbId": 200861
  },
  {
    "id": 128,
    "title": "Vadhandhi: The Fable of Velonie",
    "release": "2022-12-02",
    "language": "Tamil",
    "genre": "Mystery",
    "type": "series",
    "poster": "https://image.tmdb.org/t/p/w500/2EgR5kgv4yHbJpR3GutxzbGd4rw.jpg",
    "tmdbId": 200881
  },
  {
    "id": 129,
    "title": "Sweet Kaaram Coffee",
    "release": "2023-07-06",
    "language": "Tamil",
    "genre": "Drama",
    "type": "series",
    "poster": "https://image.tmdb.org/t/p/w500/qhm8HKWUVS5BbWLqM8C4AE2NnXl.jpg",
    "tmdbId": 201088
  },
  {
    "id": 130,
    "title": "Modern Love Chennai",
    "release": "2023-05-18",
    "language": "Tamil",
    "genre": "Romance",
    "type": "series",
    "poster": "https://image.tmdb.org/t/p/w500/AuKtpbcL1OS2S7kIFRkHXvjcBr7.jpg",
    "tmdbId": 200874
  },
  {
    "id": 131,
    "title": "Inspector Rishi",
    "release": "2024-03-29",
    "language": "Tamil",
    "genre": "Crime",
    "type": "series",
    "poster": "https://image.tmdb.org/t/p/w500/w5jcmfhqjGQxtXvWQ2xt60ueGZA.jpg",
    "tmdbId": 249543
  },
  {
    "id": 132,
    "title": "Kerala Crime Files",
    "release": "2023-06-23",
    "language": "Malayalam",
    "genre": "Crime",
    "type": "series",
    "poster": "https://image.tmdb.org/t/p/w500/eM2gQTFRoMAaJ3AjGiB10LZU8n6.jpg",
    "tmdbId": 228658
  },
  {
    "id": 133,
    "title": "Masterpeace",
    "release": "2023-10-27",
    "language": "Malayalam",
    "genre": "Comedy",
    "type": "series",
    "poster": "https://image.tmdb.org/t/p/w500/hUOiNi5uFmDNOYLn2hCrgtSwNPA.jpg",
    "tmdbId": 236058
  },
  {
    "id": 134,
    "title": "Perilloor Premier League",
    "release": "2024-01-05",
    "language": "Malayalam",
    "genre": "Comedy",
    "type": "series",
    "poster": "https://image.tmdb.org/t/p/w500/zuQRHydJ1Xojty6EHhWRMNT7ooO.jpg",
    "tmdbId": 241088
  },
  {
    "id": 135,
    "title": "Poacher",
    "release": "2024-02-23",
    "language": "Malayalam",
    "genre": "Drama",
    "type": "series",
    "poster": "https://image.tmdb.org/t/p/w500/87k8iEsv7DvCMrJPtoGTxk6GOZr.jpg",
    "tmdbId": 216636
  },
  {
    "id": 136,
    "title": "1000 Babies",
    "release": "2024-10-18",
    "language": "Malayalam",
    "genre": "Thriller",
    "type": "series",
    "poster": "https://image.tmdb.org/t/p/w500/j9EdxlAReZ27m29kTP0cqaQOeoe.jpg",
    "tmdbId": 261576
  },
  {
    "id": 137,
    "title": "Squid Game",
    "release": "2021-09-17",
    "language": "Korean",
    "genre": "Action",
    "type": "series",
    "poster": "https://image.tmdb.org/t/p/w500/1QdXdRYfktUSONkl1oD5gc6Be0s.jpg",
    "tmdbId": 93405
  },
  {
    "id": 138,
    "title": "All of Us Are Dead",
    "release": "2022-01-28",
    "language": "Korean",
    "genre": "Horror",
    "type": "series",
    "poster": "https://image.tmdb.org/t/p/w500/pTEFqAjLd5YTsMD6NSUxV6Dq7A6.jpg",
    "tmdbId": 99966
  },
  {
    "id": 139,
    "title": "Crash Landing on You",
    "release": "2019-12-14",
    "language": "Korean",
    "genre": "Romance",
    "type": "series",
    "poster": "https://image.tmdb.org/t/p/w500/fgBNLPr6mC8pxuR79ENAJY4nBmj.jpg",
    "tmdbId": 94796
  },
  {
    "id": 140,
    "title": "The Glory",
    "release": "2022-12-30",
    "language": "Korean",
    "genre": "Drama",
    "type": "series",
    "poster": "https://image.tmdb.org/t/p/w500/uUM4LVlPgIrww07OoEKrGWlS1Ej.jpg",
    "tmdbId": 136283
  },
  {
    "id": 141,
    "title": "Vincenzo",
    "release": "2021-02-20",
    "language": "Korean",
    "genre": "Crime",
    "type": "series",
    "poster": "https://image.tmdb.org/t/p/w500/qbkSS1cTjT4DzIwD44bdhTuYgdT.jpg",
    "tmdbId": 117376
  },
  {
    "id": 142,
    "title": "Kingdom",
    "release": "2019-01-25",
    "language": "Korean",
    "genre": "Horror",
    "type": "series",
    "poster": "https://image.tmdb.org/t/p/w500/AsICtiVtz4icMQQRwDvOzfaTzjK.jpg",
    "tmdbId": 70593
  },
  {
    "id": 143,
    "title": "Alice in Borderland",
    "release": "2020-12-10",
    "language": "Japanese",
    "genre": "Sci-Fi",
    "type": "series",
    "poster": "https://image.tmdb.org/t/p/w500/Ac8ruycRXzgcsndTZFK6ouGA0FA.jpg",
    "tmdbId": 110316
  },
  {
    "id": 144,
    "title": "Shōgun",
    "release": "2024-02-27",
    "language": "Japanese",
    "genre": "Drama",
    "type": "series",
    "poster": "https://image.tmdb.org/t/p/w500/7O4iVfOMQmdCSxhOg1WnzG1AgYT.jpg",
    "tmdbId": 126308
  },
  {
    "id": 145,
    "title": "Attack on Titan",
    "release": "2013-04-07",
    "language": "Japanese",
    "genre": "Animation",
    "type": "series",
    "poster": "https://image.tmdb.org/t/p/w500/hTP1DtLGFamjfu8WqjnuQdP1n4i.jpg",
    "tmdbId": 1429
  },
  {
    "id": 146,
    "title": "JUJUTSU KAISEN",
    "release": "2020-10-03",
    "language": "Japanese",
    "genre": "Animation",
    "type": "series",
    "poster": "https://image.tmdb.org/t/p/w500/6qQzMJG27XOJsyAEEIisoJB45j2.jpg",
    "tmdbId": 95479
  },
  {
    "id": 147,
    "title": "Money Heist",
    "release": "2017-05-02",
    "language": "Spanish",
    "genre": "Crime",
    "type": "series",
    "poster": "https://image.tmdb.org/t/p/w500/reEMJA1uzscCbkpeRJeTT2bjqUp.jpg",
    "tmdbId": 71446
  },
  {
    "id": 148,
    "title": "Elite",
    "release": "2018-10-05",
    "language": "Spanish",
    "genre": "Drama",
    "type": "series",
    "poster": "https://image.tmdb.org/t/p/w500/3NTAbAiao4JLzFQw6YxP1YZppM8.jpg",
    "tmdbId": 76669
  },
  {
    "id": 149,
    "title": "Narcos",
    "release": "2015-08-28",
    "language": "Spanish",
    "genre": "Crime",
    "type": "series",
    "poster": "https://image.tmdb.org/t/p/w500/rTmal9fDbwh5F0waol2hq35U4ah.jpg",
    "tmdbId": 63351
  },
  {
    "id": 150,
    "title": "Berlin",
    "release": "2023-12-29",
    "language": "Spanish",
    "genre": "Action",
    "type": "series",
    "poster": "https://image.tmdb.org/t/p/w500/69YuvoiWTtK6oyYH2Jl4Q6SgZ59.jpg",
    "tmdbId": 146176
  },
  {
    "id": 151,
    "title": "Lupin",
    "release": "2021-01-08",
    "language": "French",
    "genre": "Mystery",
    "type": "series",
    "poster": "https://image.tmdb.org/t/p/w500/h6Z2oogE4mJk2uffdtIlLhb0EHx.jpg",
    "tmdbId": 96677
  },
  {
    "id": 152,
    "title": "Into the Night",
    "release": "2020-05-01",
    "language": "French",
    "genre": "Sci-Fi",
    "type": "series",
    "poster": "https://image.tmdb.org/t/p/w500/na6fk6WculNrUPCPPQSPNjNyjvX.jpg",
    "tmdbId": 93811
  },
  {
    "id": 153,
    "title": "Marianne",
    "release": "2019-09-13",
    "language": "French",
    "genre": "Horror",
    "type": "series",
    "poster": "https://image.tmdb.org/t/p/w500/hpeaMzflHMEepUGiCjXld7lrnC2.jpg",
    "tmdbId": 92916
  },
  {
    "id": 154,
    "title": "Black Spot (Zone Blanche)",
    "release": "2017-04-10",
    "language": "French",
    "genre": "Mystery",
    "type": "series",
    "poster": "https://image.tmdb.org/t/p/w500/24YXi0GA3DsrPBe7ttw8XVV3uL7.jpg",
    "tmdbId": 70613
  },
  {
    "id": 155,
    "title": "Dark",
    "release": "2017-12-01",
    "language": "German",
    "genre": "Sci-Fi",
    "type": "series",
    "poster": "https://image.tmdb.org/t/p/w500/wSXJHO9WHLb0aCwvQrtco7vOmWA.jpg",
    "tmdbId": 70523
  },
  {
    "id": 156,
    "title": "1899",
    "release": "2022-11-17",
    "language": "German",
    "genre": "Sci-Fi",
    "type": "series",
    "poster": "https://image.tmdb.org/t/p/w500/gZleGu1MQVBArH2dlpZ9CGi0hhy.jpg",
    "tmdbId": 90669
  },
  {
    "id": 157,
    "title": "Babylon Berlin",
    "release": "2017-10-13",
    "language": "German",
    "genre": "Crime",
    "type": "series",
    "poster": "https://image.tmdb.org/t/p/w500/hr18RHPMQSA0zbCzAZN2asIOqy5.jpg",
    "tmdbId": 66980
  },
  {
    "id": 158,
    "title": "Gomorrah",
    "release": "2014-05-06",
    "language": "Italian",
    "genre": "Crime",
    "type": "series",
    "poster": "https://image.tmdb.org/t/p/w500/cXsagSyQQki9vTbV3TTxRCGIIlQ.jpg",
    "tmdbId": 61068
  },
  {
    "id": 159,
    "title": "Suburra: Blood on Rome",
    "release": "2017-10-06",
    "language": "Italian",
    "genre": "Crime",
    "type": "series",
    "poster": "https://image.tmdb.org/t/p/w500/ri1WF0vxDfJcUW8iNUOu8OsmVeJ.jpg",
    "tmdbId": 73671
  },
  {
    "id": 160,
    "title": "My Brilliant Friend",
    "release": "2018-11-18",
    "language": "Italian",
    "genre": "Drama",
    "type": "series",
    "poster": "https://image.tmdb.org/t/p/w500/73JsZG2jXe5yYZ5k49HP8oPh7rq.jpg",
    "tmdbId": 78154
  },
  {
    "id": 161,
    "title": "3%",
    "release": "2016-11-25",
    "language": "Portuguese",
    "genre": "Sci-Fi",
    "type": "series",
    "poster": "https://image.tmdb.org/t/p/w500/d8mmn9thQ5dBk2qbv6BCqGUXWK3.jpg",
    "tmdbId": 69050
  },
  {
    "id": 162,
    "title": "Invisible City",
    "release": "2021-02-05",
    "language": "Portuguese",
    "genre": "Fantasy",
    "type": "series",
    "poster": "https://image.tmdb.org/t/p/w500/i6v77Rcez8BEbsQ2FbUVfzs3yT2.jpg",
    "tmdbId": 110529
  },
  {
    "id": 163,
    "title": "Sintonia",
    "release": "2019-08-09",
    "language": "Portuguese",
    "genre": "Drama",
    "type": "series",
    "poster": "https://image.tmdb.org/t/p/w500/safjAD2bBNT1grB23rFff5ChwDv.jpg",
    "tmdbId": 78074
  },
  {
    "id": 164,
    "title": "Good Morning, Verônica",
    "release": "2020-10-01",
    "language": "Portuguese",
    "genre": "Crime",
    "type": "series",
    "poster": "https://image.tmdb.org/t/p/w500/pCjXfCDnbO46N0My7rJ23zQ5K1c.jpg",
    "tmdbId": 110115
  },
  {
    "id": 165,
    "title": "Byomkesh",
    "release": "2017-10-14",
    "language": "Bengali",
    "genre": "Mystery",
    "type": "series",
    "poster": "https://image.tmdb.org/t/p/w500/aFQKRML4ttKLTRXbZbtEsOq5qcX.jpg",
    "tmdbId": 75964
  },
  {
    "id": 166,
    "title": "Eken Babu",
    "release": "2018-03-03",
    "language": "Bengali",
    "genre": "Comedy",
    "type": "series",
    "poster": "https://image.tmdb.org/t/p/w500/8YMtqgIEDtk55vNqBEFSgsFgX1d.jpg",
    "tmdbId": 85930
  },
  {
    "id": 167,
    "title": "Feluda Pherot",
    "release": "2020-12-25",
    "language": "Bengali",
    "genre": "Adventure",
    "type": "series",
    "poster": "https://image.tmdb.org/t/p/w500/1SXvTFbiDlvMidEBMb6Rqm2GB5y.jpg",
    "tmdbId": 115260
  },
  {
    "id": 168,
    "title": "Gora",
    "release": "2022-01-07",
    "language": "Bengali",
    "genre": "Thriller",
    "type": "series",
    "poster": "https://image.tmdb.org/t/p/w500/9IPVD7PafCMe3vENBjOUt5EvjKE.jpg",
    "tmdbId": 153871
  },
  {
    "id": 169,
    "title": "Samantar",
    "release": "2020-03-13",
    "language": "Marathi",
    "genre": "Thriller",
    "type": "series",
    "poster": "https://image.tmdb.org/t/p/w500/f2pwj9RTPEuShKJcm3hZbMe3RZq.jpg",
    "tmdbId": 101644
  },
  {
    "id": 170,
    "title": "City of Dreams",
    "release": "2019-05-03",
    "language": "Marathi",
    "genre": "Crime",
    "type": "series",
    "poster": "https://image.tmdb.org/t/p/w500/f1uYNCBNHpLUuhh5FK82gcKY8RA.jpg",
    "tmdbId": 89080
  },
  {
    "id": 171,
    "title": "Pet Puraan",
    "release": "2022-05-06",
    "language": "Marathi",
    "genre": "Comedy",
    "type": "series",
    "poster": "https://image.tmdb.org/t/p/w500/negijog2C7vdGhCjlaW6WnVB4IN.jpg",
    "tmdbId": 199317
  },
  {
    "id": 172,
    "title": "Vitthal Teedi",
    "release": "2021-05-07",
    "language": "Gujarati",
    "genre": "Drama",
    "type": "series",
    "poster": "https://image.tmdb.org/t/p/w500/2f0S6ixCuTXIaTU2UebL6TkWs9K.jpg",
    "tmdbId": 124930
  },
  {
    "id": 173,
    "title": "Kohrra",
    "release": "2023-07-15",
    "language": "Punjabi",
    "genre": "Crime",
    "type": "series",
    "poster": "https://image.tmdb.org/t/p/w500/oZbiASZweEKFOHsl56QTeNJ6a8R.jpg",
    "tmdbId": 230034
  },
  {
    "id": 174,
    "title": "Tabbar",
    "release": "2021-10-15",
    "language": "Punjabi",
    "genre": "Thriller",
    "type": "series",
    "poster": "https://image.tmdb.org/t/p/w500/otlPrZEtwTlNfyZWisUgZgAiLUR.jpg",
    "tmdbId": 136460
  },
  {
    "id": 175,
    "title": "Chamak",
    "release": "2023-12-07",
    "language": "Punjabi",
    "genre": "Drama",
    "type": "series",
    "poster": "https://image.tmdb.org/t/p/w500/9CEV7ZohzIbxUi6SMLb59Ey54ou.jpg",
    "tmdbId": 240518
  },
  {
    "id": 176,
    "title": "The Untamed",
    "release": "2019-06-27",
    "language": "Chinese",
    "genre": "Fantasy",
    "type": "series",
    "poster": "https://image.tmdb.org/t/p/w500/8TZbpPpLQVS2i7P7yUVhrFlFsmW.jpg",
    "tmdbId": 90761
  },
  {
    "id": 177,
    "title": "3 Body Problem",
    "release": "2024-03-21",
    "language": "Chinese",
    "genre": "Sci-Fi",
    "type": "series",
    "poster": "https://image.tmdb.org/t/p/w500/ykZ7hlShkdRQaL2aiieXdEMmrLb.jpg",
    "tmdbId": 108545
  },
  {
    "id": 178,
    "title": "Word of Honor",
    "release": "2021-02-22",
    "language": "Chinese",
    "genre": "Fantasy",
    "type": "series",
    "poster": "https://image.tmdb.org/t/p/w500/6FEfm5zO6dKSbB2vsWJKAQ4fgTD.jpg",
    "tmdbId": 198002
  },
  {
    "id": 179,
    "title": "Gangs of Puri",
    "release": "2022-06-12",
    "language": "Odia",
    "genre": "Crime",
    "type": "series",
    "poster": "https://image.tmdb.org/t/p/w500/sNmxZkpSYtahlgXiVlz61Mm3VVI.jpg",
    "tmdbId": 204658
  }
];

export const LANGUAGES = [
  'All', 'English', 'Hindi', 'Kannada', 'Telugu', 'Tamil', 'Malayalam',
  'Korean', 'Japanese', 'Spanish', 'French', 'Portuguese', 'Italian',
  'Bengali', 'Chinese', 'Marathi', 'Gujarati', 'Punjabi', 'Odia', 'German'
] as const;

export const GENRES = [
  'All', 'Action', 'Sci-Fi', 'Thriller', 'Sports', 'Animation', 'Fantasy',
  'Crime', 'Comedy', 'Drama', 'Romance', 'Horror', 'Mystery', 'Adventure'
] as const;
