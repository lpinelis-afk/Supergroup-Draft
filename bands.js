/* ==========================================================================
   bands.js  --  THE BAND DATABASE
   ==========================================================================
   This is the file you edit to add bands. One entry per band:

     {name:"Band Name", vibe:"alt", members:[["Member Name","Instrument"], ...]},

   name     Must be unique. Shown on the card and in the lineup.

   vibe     The band's stage energy. Used for "chemistry" scoring: some vibes
            clash (e.g. mellow + aggressive). Must be one of VIBES below.
            (See rules.js -> CLASH_RULES for which pairs cost points.)

   members  [name, instruments] pairs. The instrument text decides which
            slot the member can fill. Separate multiple instruments with "/",
            most important FIRST -- the first one is their "Perfect Fit":
              "Vocals"          -> Lead Vocals slot
              "Guitar"          -> Lead Guitar slot
              "Bass"            -> Bass slot
              "Drums"           -> Drums slot
              "Keys"            -> Keyboards slot
              "Violin/Viola/Accordion" -> Violin/Accordion slot
              anything else     -> Wildcard slot (e.g. "Trumpet")
            "Vocals/Guitar" means: try Lead Vocals first, then Lead Guitar,
            then Wildcard (the game always falls back to Wildcard).

   Tips:
   - Keep each band on one line and end every entry with a comma.
   - Bands with Keys or Violin/Accordion players are valuable because those
     slots are rare. The game avoids showing bands that can't fill any open slot.
   - A double quote inside a name must be escaped with a backslash, like the
     "Flake" in Rammstein's keyboardist below.
   ========================================================================== */

// The allowed vibe values. game.js warns in the browser console if a band uses
// a vibe that isn't in this list (usually a typo).
const VIBES = ["aggressive", "classic", "alt", "mellow", "chaotic", "theatrical", "punk"];

const BANDS = [
  {name:"Black Sabbath", vibe:"aggressive", members:[["Ozzy Osbourne","Vocals"],["Tony Iommi","Guitar"],["Geezer Butler","Bass"],["Bill Ward","Drums"]]},
  {name:"Led Zeppelin", vibe:"classic", members:[["Robert Plant","Vocals"],["Jimmy Page","Guitar"],["John Paul Jones","Bass/Keys"],["John Bonham","Drums"]]},
  {name:"Nirvana", vibe:"alt", members:[["Kurt Cobain","Vocals/Guitar"],["Krist Novoselic","Bass"],["Dave Grohl","Drums"]]},
  {name:"Queens of the Stone Age", vibe:"alt", members:[["Josh Homme","Vocals/Guitar"],["Nick Oliveri","Bass"],["Troy Van Leeuwen","Guitar"]]},
  {name:"System of a Down", vibe:"aggressive", members:[["Serj Tankian","Vocals"],["Daron Malakian","Guitar"],["Shavo Odadjian","Bass"],["John Dolmayan","Drums"]]},
  {name:"Soundgarden", vibe:"alt", members:[["Chris Cornell","Vocals"],["Kim Thayil","Guitar"],["Ben Shepherd","Bass"],["Matt Cameron","Drums"]]},
  {name:"Alice in Chains", vibe:"alt", members:[["Layne Staley","Vocals"],["Jerry Cantrell","Guitar/Vocals"],["Mike Starr","Bass"],["Sean Kinney","Drums"]]},
  {name:"Pearl Jam", vibe:"alt", members:[["Eddie Vedder","Vocals"],["Mike McCready","Guitar"],["Jeff Ament","Bass"],["Matt Cameron","Drums"]]},
  {name:"Metallica", vibe:"aggressive", members:[["James Hetfield","Vocals/Guitar"],["Kirk Hammett","Guitar"],["Robert Trujillo","Bass"],["Lars Ulrich","Drums"]]},
  {name:"Deftones", vibe:"aggressive", members:[["Chino Moreno","Vocals"],["Stephen Carpenter","Guitar"],["Sergio Vega","Bass"],["Abe Cunningham","Drums"]]},
  {name:"Tool", vibe:"aggressive", members:[["Maynard James Keenan","Vocals"],["Adam Jones","Guitar"],["Justin Chancellor","Bass"],["Danny Carey","Drums"]]},
  {name:"Rage Against the Machine", vibe:"aggressive", members:[["Zack de la Rocha","Vocals"],["Tom Morello","Guitar"],["Tim Commerford","Bass"],["Brad Wilk","Drums"]]},
  {name:"Red Hot Chili Peppers", vibe:"chaotic", members:[["Anthony Kiedis","Vocals"],["John Frusciante","Guitar"],["Flea","Bass"],["Chad Smith","Drums"]]},
  {name:"Pink Floyd", vibe:"mellow", members:[["David Gilmour","Guitar/Vocals"],["Roger Waters","Bass/Vocals"],["Richard Wright","Keys"],["Nick Mason","Drums"]]},
  {name:"The Who", vibe:"classic", members:[["Roger Daltrey","Vocals"],["Pete Townshend","Guitar"],["John Entwistle","Bass"],["Keith Moon","Drums"]]},
  {name:"The Rolling Stones", vibe:"classic", members:[["Mick Jagger","Vocals"],["Keith Richards","Guitar"],["Bill Wyman","Bass"],["Charlie Watts","Drums"]]},
  {name:"AC/DC", vibe:"classic", members:[["Brian Johnson","Vocals"],["Angus Young","Guitar"],["Cliff Williams","Bass"],["Phil Rudd","Drums"]]},
  {name:"Guns N' Roses", vibe:"classic", members:[["Axl Rose","Vocals"],["Slash","Guitar"],["Duff McKagan","Bass"],["Steven Adler","Drums"]]},
  {name:"Radiohead", vibe:"mellow", members:[["Thom Yorke","Vocals"],["Jonny Greenwood","Guitar"],["Colin Greenwood","Bass"],["Philip Selway","Drums"]]},
  {name:"Foo Fighters", vibe:"alt", members:[["Dave Grohl","Vocals/Guitar"],["Chris Shiflett","Guitar"],["Nate Mendel","Bass"],["Taylor Hawkins","Drums"]]},
  {name:"Smashing Pumpkins", vibe:"alt", members:[["Billy Corgan","Vocals/Guitar"],["James Iha","Guitar"],["D'arcy Wretzky","Bass"],["Jimmy Chamberlin","Drums"]]},
  {name:"Nine Inch Nails", vibe:"theatrical", members:[["Trent Reznor","Vocals"],["Robin Finck","Guitar"],["Atticus Ross","Keys/Production"],["Ilan Rubin","Drums"]]},
  {name:"Primus", vibe:"chaotic", members:[["Les Claypool","Bass/Vocals"],["Larry LaLonde","Guitar"],["Tim Alexander","Drums"]]},
  {name:"Sublime", vibe:"mellow", members:[["Bradley Nowell","Vocals/Guitar"],["Eric Wilson","Bass"],["Bud Gaugh","Drums"]]},
  {name:"Kyuss", vibe:"alt", members:[["John Garcia","Vocals"],["Josh Homme","Guitar"],["Nick Oliveri","Bass"],["Brant Bjork","Drums"]]},
  {name:"The Beatles", vibe:"mellow", members:[["John Lennon","Vocals/Guitar"],["Paul McCartney","Bass/Vocals"],["George Harrison","Guitar"],["Ringo Starr","Drums"]]},
  {name:"The Jimi Hendrix Experience", vibe:"classic", members:[["Jimi Hendrix","Guitar/Vocals"],["Noel Redding","Bass"],["Mitch Mitchell","Drums"]]},
  {name:"Cream", vibe:"mellow", members:[["Eric Clapton","Guitar"],["Jack Bruce","Bass/Vocals"],["Ginger Baker","Drums"]]},
  {name:"The Velvet Underground", vibe:"mellow", members:[["Lou Reed","Vocals/Guitar"],["John Cale","Bass/Viola"],["Sterling Morrison","Guitar"],["Moe Tucker","Drums"]]},
  {name:"Rush", vibe:"classic", members:[["Geddy Lee","Vocals/Bass"],["Alex Lifeson","Guitar"],["Neil Peart","Drums"]]},
  {name:"Van Halen", vibe:"classic", members:[["David Lee Roth","Vocals"],["Eddie Van Halen","Guitar"],["Michael Anthony","Bass"],["Alex Van Halen","Drums"]]},
  {name:"Gogol Bordello", vibe:"chaotic", members:[["Eugene Hütz","Vocals/Guitar"],["Sergey Ryabtsev","Violin"],["Thomas Gobena","Bass"],["Pedro Erazo","Percussion"],["Pasha Newmer","Accordion"]]},
  {name:"Screaming Trees", vibe:"mellow", members:[["Mark Lanegan","Vocals"],["Gary Lee Conner","Guitar"],["Van Conner","Bass"],["Barrett Martin","Drums"]]},
  {name:"Rammstein", vibe:"theatrical", members:[["Till Lindemann","Vocals"],["Richard Kruspe","Guitar"],["Paul Landers","Guitar"],["Oliver Riedel","Bass"],["Christoph Schneider","Drums"],["Christian \"Flake\" Lorenz","Keys"]]},
  {name:"Children of Bodom", vibe:"aggressive", members:[["Alexi Laiho","Vocals/Guitar"],["Janne Wirman","Keys"],["Henkka Seppälä","Bass"],["Jaska Raatikainen","Drums"]]},
  {name:"Sepultura", vibe:"aggressive", members:[["Max Cavalera","Vocals/Guitar"],["Andreas Kisser","Guitar"],["Paulo Jr.","Bass"],["Igor Cavalera","Drums"]]},
  {name:"Judas Priest", vibe:"aggressive", members:[["Rob Halford","Vocals"],["Glenn Tipton","Guitar"],["K.K. Downing","Guitar"],["Ian Hill","Bass"],["Scott Travis","Drums"]]},
  {name:"Iron Maiden", vibe:"aggressive", members:[["Bruce Dickinson","Vocals"],["Dave Murray","Guitar"],["Adrian Smith","Guitar"],["Steve Harris","Bass"],["Nicko McBrain","Drums"]]},
  {name:"Slayer", vibe:"aggressive", members:[["Tom Araya","Vocals/Bass"],["Kerry King","Guitar"],["Jeff Hanneman","Guitar"],["Dave Lombardo","Drums"]]},
  {name:"Pantera", vibe:"aggressive", members:[["Phil Anselmo","Vocals"],["Dimebag Darrell","Guitar"],["Rex Brown","Bass"],["Vinnie Paul","Drums"]]},
  {name:"Mastodon", vibe:"aggressive", members:[["Brent Hinds","Guitar/Vocals"],["Bill Kelliher","Guitar"],["Troy Sanders","Bass/Vocals"],["Brann Dailor","Drums/Vocals"]]},
  {name:"Green Day", vibe:"punk", members:[["Billie Joe Armstrong","Vocals/Guitar"],["Mike Dirnt","Bass"],["Tré Cool","Drums"]]},
  {name:"The Offspring", vibe:"punk", members:[["Dexter Holland","Vocals/Guitar"],["Noodles","Guitar"],["Greg K.","Bass"],["Pete Parada","Drums"]]},
  {name:"Dead Kennedys", vibe:"punk", members:[["Jello Biafra","Vocals"],["East Bay Ray","Guitar"],["Klaus Flouride","Bass"],["D.H. Peligro","Drums"]]},
  {name:"Bad Religion", vibe:"punk", members:[["Greg Graffin","Vocals"],["Brett Gurewitz","Guitar"],["Jay Bentley","Bass"],["Brooks Wackerman","Drums"]]},
  {name:"NOFX", vibe:"punk", members:[["Fat Mike","Vocals/Bass"],["Eric Melvin","Guitar"],["El Hefe","Guitar/Vocals"],["Erik Sandin","Drums"]]},
  {name:"The Ramones", vibe:"punk", members:[["Joey Ramone","Vocals"],["Johnny Ramone","Guitar"],["Dee Dee Ramone","Bass"],["Tommy Ramone","Drums"]]},
  {name:"Rancid", vibe:"punk", members:[["Tim Armstrong","Vocals/Guitar"],["Lars Frederiksen","Guitar/Vocals"],["Matt Freeman","Bass"],["Branden Steineckert","Drums"]]},
  {name:"Twilight Force", vibe:"theatrical", members:[["Alessandro Conti","Vocals"],["Galen Stapley","Guitar"],["Bradley Hall","Guitar"],["Alex Miles","Bass"],["Isak Olsson","Drums"],["Daniel Beckman","Keys"],["Kristin Starkey","Vocals"]]},
  {name:"Dream Theater", vibe:"aggressive", members:[["James LaBrie","Vocals"],["John Petrucci","Guitar"],["John Myung","Bass"],["Jordan Rudess","Keys"],["Mike Portnoy","Drums"]]},
  {name:"Opeth", vibe:"aggressive", members:[["Mikael Åkerfeldt","Vocals/Guitar"],["Fredrik Åkesson","Guitar"],["Martín Méndez","Bass"],["Joakim Svalberg","Keys"],["Waltteri Väyrynen","Drums"]]},
  {name:"Symphony X", vibe:"aggressive", members:[["Russell Allen","Vocals"],["Michael Romeo","Guitar"],["Michael LePond","Bass"],["Michael Pinnella","Keys"],["Jason Rullo","Drums"]]},
  {name:"Nightwish", vibe:"theatrical", members:[["Floor Jansen","Vocals"],["Emppu Vuorinen","Guitar"],["Jukka Koskinen","Bass"],["Tuomas Holopainen","Keys"],["Kai Hahto","Drums"],["Troy Donockley","Vocals"]]},
  {name:"The Tiger Lillies", vibe:"theatrical", members:[["Martyn Jacques","Vocals/Accordion"],["Adrian Stout","Bass/Vocals"],["Budi Butenop","Drums"]]},
  {name:"Acid Bath", vibe:"aggressive", members:[["Dax Riggs","Vocals"],["Sammy Duet","Guitar"],["Mike Sanchez","Guitar"],["Alex Bergeron","Bass"],["Zack Simmons","Drums"]]},
  {name:"Leningrad", vibe:"chaotic", members:[["Sergey Shnurov","Vocals"],["Vasily Zubkov","Bass"],["Denis Martynov","Trumpet"],["Alexander Galnykin","Trombone"],["Mikhail Kozodaev","Drums"],["Dmitry Gorevoy","Saxophone"],["Viktor Lushnikov","Keys"]]}
];
