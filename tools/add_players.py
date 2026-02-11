
import os
import re

# LEGENDS: [Birth City, FIFA Position, Clever Hint, Debut Team]
LEGEND_HINTS = {
    "Franz Beckenbauer": ["Múnich", "DFC", "Kaiser", "Bayern"],
    "Gerd Müller": ["Nördlingen", "DC", "Torpedo", "Nördlingen"],
    "Michael Ballack": ["Görlitz", "MC", "Leverkusen", "Chemnitzer"],
    "Paul Breitner": ["Kolbermoor", "LI", "Afro", "Bayern"],
    "Oliver Kahn": ["Karlsruhe", "POR", "Titán", "Karlsruher"],
    "Jürgen Klinsmann": ["Göppingen", "DC", "Inter", "Kickers"],
    "Sepp Maier": ["Metten", "POR", "Gato", "Bayern"],
    "Lothar Matthäus": ["Erlangen", "MCD", "Mundiales", "Gladbach"],
    "Karl-Heinz Rummenigge": ["Lippstadt", "DC", "Inter", "Bayern"],
    "Uwe Seeler": ["Hamburgo", "DC", "Hamburgo", "Hamburgo"],
    "Gabriel Batistuta": ["Reconquista", "DC", "Batigol", "Newell's"],
    "Hernán Crespo": ["Florida", "DC", "Valdanito", "River"],
    "Alfredo Di Stéfano": ["Buenos Aires", "DC", "Saeta", "River"],
    "Mario Alberto Kempes": ["Bell Ville", "DC", "Matador", "Instituto"],
    "Diego Armando Maradona": ["Lanús", "MCO", "D10S", "Argentinos"],
    "Daniel Passarella": ["Chacabuco", "DFC", "Kaiser", "Sarmiento"],
    "Javier Saviola": ["Buenos Aires", "DC", "Conejo", "River"],
    "Omar Sívori": ["San Nicolás", "DC", "Cabezón", "River"],
    "Juan Sebastián Verón": ["La Plata", "MC", "Brujita", "Estudiantes"],
    "Javier Zanetti": ["Buenos Aires", "LD", "Tractor", "Talleres"],
    "Paulo Dybala": ["Laguna Larga", "SD", "Joya", "Instituto"],
    "Jan Ceulemans": ["Lier", "MCO", "Caje", "Lierse"],
    "Jean-Marie Pfaff": ["Lebbeke", "POR", "Simpático", "Beveren"],
    "Franky van der Elst": ["Ninove", "MCD", "Aspirador", "Molenbeek"],
    "Cafú": ["São Paulo", "LD", "Pendolino", "São Paulo"],
    "Carlos Alberto Torres": ["Río", "LD", "Capita", "Fluminense"],
    "Djalma Santos": ["São Paulo", "LD", "Enciclopedia", "Portuguesa"],
    "Paulo Roberto Falcão": ["Abelardo Luz", "MC", "Rey", "Internacional"],
    "Júnior": ["João Pessoa", "LI", "Capacete", "Flamengo"],
    "Nilton Santos": ["Río", "LI", "Enciclopedia", "Botafogo"],
    "Pelé": ["Três Corações", "DC", "Rei", "Santos"],
    "Rivaldo": ["Recife", "MCO", "Zurda", "Santa Cruz"],
    "Roberto Rivelino": ["São Paulo", "MCO", "Patada", "Corinthians"],
    "Roberto Carlos": ["Garça", "LI", "Bomba", "União"],
    "Romário": ["Río", "DC", "Baixinho", "Vasco"],
    "Ronaldinho": ["Porto Alegre", "MCO", "Sonrisa", "Gremio"],
    "Ronaldo": ["Río", "DC", "Fenômeno", "Cruzeiro"],
    "Sócrates": ["Belém", "MC", "Doctor", "Botafogo"],
    "Zico": ["Río", "MCO", "Galinho", "Flamengo"],
    "Hristo Stoichkov": ["Plovdiv", "DC", "Daga", "Hebros"],
    "Roger Milla": ["Yaundé", "DC", "León", "Eclair"],
    "Elías Figueroa": ["Valparaíso", "DFC", "Don", "Calera"],
    "Iván Zamorano": ["Santiago", "DC", "Bam-Bam", "Cobresal"],
    "Carlos Valderrama": ["Santa Marta", "MCO", "Pibe", "Magdalena"],
    "Hong Myung-bo": ["Seúl", "DFC", "Libero", "Pohang"],
    "Davor Šuker": ["Osijek", "DC", "Sukerman", "Osijek"],
    "Brian Laudrup": ["Viena", "ED", "Principito", "Brøndby"],
    "Michael Laudrup": ["Frederiksberg", "MCO", "Laudrup", "Brøndby"],
    "Peter Schmeichel": ["Gladsaxe", "POR", "Gran", "Gladsaxe"],
    "Kenny Dalglish": ["Glasgow", "DC", "King", "Celtic"],
    "Emilio Butragueño": ["Madrid", "DC", "Buitre", "Castilla"],
    "Luis Enrique Martínez": ["Gijón", "MC", "Lucho", "Sporting"],
    "Raúl González": ["Madrid", "DC", "Ángel", "Madrid"],
    "Michelle Akers": ["Santa Clara", "MC", "Pionera", "UCF"], # College debut often cited for US women of that era or Tyresö
    "Mia Hamm": ["Selma", "DC", "Jordan", "NC"], # North Carolina Tar Heels
    "Éric Cantona": ["Marsella", "DC", "King", "Auxerre"],
    "Marcel Desailly": ["Accra", "DFC", "Roca", "Nantes"],
    "Didier Deschamps": ["Bayona", "MCD", "Aguador", "Nantes"],
    "Just Fontaine": ["Marrakech", "DC", "Goles", "Casablanca"],
    "Thierry Henry": ["Les Ulis", "DC", "Tití", "Mónaco"],
    "Raymond Kopa": ["Nœux-les-Mines", "MCO", "Napoleón", "Angers"],
    "Jean-Pierre Papin": ["Boulogne", "DC", "JPP", "Valenciennes"],
    "Robert Pirès": ["Reims", "MI", "Dartagnan", "Metz"],
    "Michel Platini": ["Jœuf", "MCO", "Roi", "Nancy"],
    "Lilian Thuram": ["Pointe-à-Pitre", "DFC", "Filósofo", "Mónaco"],
    "Marius Trésor": ["Sainte-Anne", "DFC", "Tesoro", "Ajaccio"],
    "David Trezeguet": ["Ruan", "DC", "Trezegol", "Platense"],
    "Patrick Vieira": ["Dakar", "MCD", "Torre", "Cannes"],
    "Zinédine Zidane": ["Marsella", "MCO", "Zizou", "Cannes"],
    "Abédi Pelé": ["Kibi", "MCO", "Pelé", "Tamale"],
    "Ferenc Puskás": ["Budapest", "DC", "Cañoncito", "Honvéd"],
    "Gordon Banks": ["Sheffield", "POR", "Banco", "Chesterfield"],
    "David Beckham": ["Londres", "MD", "Spice", "United"],
    "Bobby Charlton": ["Ashington", "MCO", "Sir", "United"],
    "Kevin Keegan": ["Armthorpe", "DC", "Mouse", "Scunthorpe"],
    "Gary Lineker": ["Leicester", "DC", "Clean", "Leicester"],
    "Michael Owen": ["Chester", "DC", "Golden", "Liverpool"],
    "Alan Shearer": ["Newcastle", "DC", "Big", "Southampton"],
    "Roy Keane": ["Cork", "MCD", "Keano", "Cobh"],
    "George Best": ["Belfast", "ED", "Beatle", "United"],
    "Roberto Baggio": ["Caldogno", "SD", "Codino", "Vicenza"],
    "Franco Baresi": ["Travagliato", "DFC", "Piscinin", "Milan"],
    "Giuseppe Bergomi": ["Milán", "DFC", "Zio", "Inter"],
    "Giampiero Boniperti": ["Barengo", "DC", "Marisa", "Juventus"],
    "Gianluigi Buffon": ["Carrara", "POR", "Gigi", "Parma"],
    "Alessandro Del Piero": ["Conegliano", "SD", "Pinturicchio", "Padova"],
    "Giacinto Facchetti": ["Treviglio", "LI", "Capitano", "Inter"],
    "Paolo Maldini": ["Milán", "LI", "Eterno", "Milan"],
    "Alessandro Nesta": ["Roma", "DFC", "Tempesta", "Lazio"],
    "Gianni Rivera": ["Alessandria", "MCO", "Golden", "Alessandria"],
    "Paolo Rossi": ["Prato", "DC", "Pablito", "Como"],
    "Francesco Totti": ["Roma", "SD", "Capitano", "Roma"],
    "Christian Vieri": ["Bolonia", "DC", "Bobo", "Torino"],
    "Dino Zoff": ["Mariano", "POR", "Monumento", "Udinese"],
    "Hidetoshi Nakata": ["Kofu", "MCO", "Beckham", "Bellmare"],
    "George Weah": ["Monrovia", "DC", "King", "Invincible"],
    "Hugo Sánchez": ["Ciudad de México", "DC", "Hugol", "Pumas"],
    "Dennis Bergkamp": ["Ámsterdam", "SD", "Iceman", "Ajax"],
    "Johan Cruyff": ["Ámsterdam", "SD", "Flaco", "Ajax"],
    "Edgar Davids": ["Paramaribo", "MCD", "Pitbull", "Ajax"],
    "Ruud Gullit": ["Ámsterdam", "MCO", "Tulipán", "Haarlem"],
    "Patrick Kluivert": ["Ámsterdam", "DC", "Pantera", "Ajax"],
    "Johan Neeskens": ["Heemstede", "MC", "Johan", "Haarlem"],
    "Rob Rensenbrink": ["Ámsterdam", "EI", "Serpiente", "DWS"],
    "Frank Rijkaard": ["Ámsterdam", "MCD", "Todoterreno", "Ajax"],
    "Clarence Seedorf": ["Paramaribo", "MC", "Profesor", "Ajax"],
    "Marco van Basten": ["Utrecht", "DC", "Cisne", "Ajax"],
    "René van de Kerkhof": ["Helmond", "ED", "Gemelo", "Twente"],
    "Willy van de Kerkhof": ["Helmond", "MC", "Otro", "Twente"],
    "Ruud van Nistelrooy": ["Oss", "DC", "Gol", "Den Bosch"],
    "Julio César Romero": ["Luque", "MCO", "Romerito", "Luqueño"],
    "Teófilo Cubillas": ["Lima", "MCO", "Nene", "Alianza"],
    "Zbigniew Boniek": ["Bydgoszcz", "SD", "Zibi", "Widzew"],
    "Eusébio": ["Maputo", "DC", "Pantera", "Lourenço"],
    "Luís Figo": ["Lisboa", "ED", "Galáctico", "Sporting"],
    "Rui Costa": ["Lisboa", "MCO", "Maestro", "Benfica"],
    "Josef Masopust": ["Most", "MC", "Caballero", "Teplice"],
    "Pavel Nedvěd": ["Cheb", "MI", "León", "Dukla"],
    "Gheorghe Hagi": ["Săcele", "MCO", "Maradona", "Constanța"],
    "Rinat Dasáyev": ["Astracán", "POR", "Telón", "Volgar"],
    "El Hadji Diouf": ["Dakar", "DC", "Asesino", "Sochaux"],
    "Emre Belözoğlu": ["Estambul", "MC", "Maradona", "Galatasaray"],
    "Rüştü Reçber": ["Antalya", "POR", "Guerrero", "Antalyaspor"],
    "Andriy Shevchenko": ["Dvirkivshchyna", "DC", "Sheva", "Dynamo"],
    "Enzo Francescoli": ["Montevideo", "MCO", "Príncipe", "Wanderers"]
}

# --- CURRENT STARS [City, Position, Clever Hint, Debut Team] ---
current_stars_data = [
    # Man City
    ("Erling Haaland", "Leeds", "DC", "Android", "Bryne"),
    ("Phil Foden", "Stockport", "MCO", "Sniper", "City"),
    ("Rodri", "Madrid", "MCD", "Timón", "Villarreal"),
    ("Ruben Dias", "Amadora", "DFC", "Muro", "Benfica"),
    ("Josko Gvardiol", "Zagreb", "DFC", "Máscara", "Dinamo"),
    ("Bernardo Silva", "Lisboa", "MC", "Mago", "Benfica"),
    ("Jack Grealish", "Birmingham", "EI", "Gemelos", "Aston Villa"),
    ("Ederson", "Osasco", "POR", "Pies", "Ribeirão"),
    ("Kyle Walker", "Sheffield", "LD", "Flash", "Sheffield"),
    ("Jeremy Doku", "Amberes", "ED", "Regate", "Anderlecht"),
    ("Kevin De Bruyne", "Gante", "MCO", "Asistente", "Genk"),
    
    # Real Madrid
    ("Kylian Mbappé", "París", "DC", "Tortuga", "Mónaco"),
    ("Jude Bellingham", "Stourbridge", "MCO", "Hey", "Birmingham"),
    ("Vinicius Junior", "São Gonçalo", "EI", "Baila", "Flamengo"),
    ("Federico Valverde", "Montevideo", "MC", "Pajarito", "Peñarol"),
    ("Rodrygo", "Osasco", "ED", "Rayo", "Santos"),
    ("Eduardo Camavinga", "Miconje", "MCD", "Pulpo", "Rennes"),
    ("Aurélien Tchouaméni", "Ruan", "MCD", "Piano", "Burdeos"),
    ("Eder Militao", "Sertãozinho", "DFC", "Militar", "São Paulo"),
    ("Thibaut Courtois", "Bree", "POR", "Jirafa", "Genk"),
    ("Endrick", "Taguatinga", "DC", "Bobby", "Palmeiras"),
    ("Arda Güler", "Ankara", "MCO", "Talento", "Fenerbahçe"),
    ("Luka Modric", "Zadar", "MC", "Maestro", "Dinamo"),
    ("Dani Carvajal", "Leganés", "LD", "Pitbull", "Castilla"),
    
    # Arsenal
    ("Bukayo Saka", "Londres", "ED", "Starboy", "Arsenal"),
    ("Declan Rice", "Londres", "MCD", "Arroz", "West Ham"),
    ("Martin Ødegaard", "Drammen", "MCO", "Mozart", "Strømsgodset"),
    ("William Saliba", "Bondy", "DFC", "Rolls-Royce", "Saint-Étienne"),
    ("Gabriel Magalhães", "São Paulo", "DFC", "Dientes", "Avaí"),
    ("Gabriel Jesus", "São Paulo", "DC", "Teléfono", "Palmeiras"),
    ("Kai Havertz", "Aquisgrán", "DC", "Cobra", "Leverkusen"),
    ("Ben White", "Poole", "LD", "Bronceado", "Brighton"),
    
    # Barcelona
    ("Lamine Yamal", "Mataró", "ED", "304", "Barça"),
    ("Gavi", "Los Palacios", "MC", "Garra", "Barça"),
    ("Pedri", "Tegueste", "MC", "Potter", "Las Palmas"),
    ("Ronald Araújo", "Rivera", "DFC", "Búfalo", "Rentistas"),
    ("Robert Lewandowski", "Varsovia", "DC", "Tiktok", "Znicz"),
    ("Frenkie de Jong", "Gorinchem", "MC", "Rubio", "Willem II"),
    ("Raphinha", "Porto Alegre", "ED", "11", "Avaí"),
    ("Jules Koundé", "París", "LD", "Moda", "Burdeos"),
    ("Pau Cubarsí", "Estanyol", "DFC", "Kaiser", "Barça"),
    ("Alejandro Balde", "Barcelona", "LI", "Moto", "Barça"),
    
    # Bayern
    ("Jamal Musiala", "Stuttgart", "MCO", "Bambi", "Bayern"),
    ("Harry Kane", "Londres", "DC", "Huracán", "Spurs"),
    ("Leroy Sané", "Essen", "ED", "Tatuaje", "Schalke"),
    ("Joshua Kimmich", "Rottweil", "LD", "6", "Leipzig"),
    ("Alphonso Davies", "Buduburam", "LI", "Correcaminos", "Vancouver"),
    ("Manuel Neuer", "Gelsenkirchen", "POR", "Esquí", "Schalke"),
    ("Thomas Müller", "Weilheim", "SD", "Radio", "Bayern"),
    ("Min-jae Kim", "Tongyeong", "DFC", "Monstruo", "Gyeongju"),
    
    # Leverkusen
    ("Florian Wirtz", "Pulheim", "MCO", "Talento", "Leverkusen"),
    ("Jeremie Frimpong", "Ámsterdam", "LD", "Speed", "Celtic"),
    ("Alejandro Grimaldo", "Valencia", "LI", "Golazo", "Barça"),
    ("Granit Xhaka", "Basilea", "MC", "Líder", "Basilea"),
    
    # Inter
    ("Lautaro Martínez", "Bahía Blanca", "DC", "Toro", "Racing"),
    ("Nicolò Barella", "Cagliari", "MC", "Motor", "Cagliari"),
    ("Alessandro Bastoni", "Casalmaggiore", "DFC", "Elegancia", "Atalanta"),
    ("Hakan Çalhanoğlu", "Mannheim", "MC", "Sniper", "Karlsluher"),
    ("Federico Dimarco", "Milán", "LI", "Zurda", "Inter"),
    
    # PSG
    ("Achraf Hakimi", "Madrid", "LD", "Ave", "Madrid"),
    ("Ousmane Dembélé", "Vernon", "ED", "Dembouz", "Rennes"),
    ("Warren Zaïre-Emery", "Montreuil", "MC", "Niño", "PSG"),
    ("Vitinha", "Santo Tirso", "MC", "Pequeño", "Porto"),
    ("Marquinhos", "São Paulo", "DFC", "Capitán", "Corinthians"),
    ("Gianluigi Donnarumma", "Castellammare", "POR", "Gigio", "Milan"),
    ("Bradley Barcola", "Lyon", "EI", "Veloz", "Lyon"),
    
    # Liverpool
    ("Mohamed Salah", "Nagrig", "ED", "Faraón", "Mokawloon"),
    ("Virgil van Dijk", "Breda", "DFC", "Virgil", "Groningen"),
    ("Trent Alexander-Arnold", "Liverpool", "LD", "Centro", "Liverpool"),
    ("Alexis Mac Allister", "Santa Rosa", "MC", "Colo", "Argentinos"),
    ("Dominik Szoboszlai", "Székesfehérvár", "MCO", "Szobo", "Liefering"),
    ("Luis Díaz", "Barrancas", "EI", "Lucho", "Barranquilla"),
    ("Darwin Núñez", "Artigas", "DC", "Pantera", "Peñarol"),
    ("Alisson Becker", "Novo Hamburgo", "POR", "Santo", "Internacional"),

    # Others
    ("Bruno Fernandes", "Maia", "MCO", "Magnifico", "Novara"),
    ("Marcus Rashford", "Manchester", "EI", "MBE", "United"),
    ("Lisandro Martínez", "Gualeguay", "DFC", "Carnicero", "Newell's"),
    ("Alejandro Garnacho", "Madrid", "EI", "Bichito", "United"),
    
    ("Heung-min Son", "Chuncheon", "EI", "Sanny", "Hamburgo"),
    ("James Maddison", "Coventry", "MCO", "Dardos", "Coventry"),
    
    ("Cole Palmer", "Manchester", "MCO", "Cold", "City"),
    ("Enzo Fernández", "San Martín", "MC", "Gardel", "River"),
    ("Moisés Caicedo", "Santo Domingo", "MCD", "Niño", "Independiente"),
    
    ("Alexander Isak", "Solna", "DC", "Unicornio", "AIK"),
    ("Bruno Guimarães", "Río", "MC", "Mágico", "Audax"),
    
    ("Khvicha Kvaratskhelia", "Tiflis", "EI", "Kvaradona", "Dinamo"),
    ("Victor Osimhen", "Lagos", "DC", "Máscara", "Wolfsburgo"), 
    
    ("Rafael Leão", "Almada", "EI", "Sonriente", "Sporting"),
    ("Theo Hernández", "Marsella", "LI", "TGV", "Atleti"),
    ("Mike Maignan", "Cayena", "POR", "Magic", "Lille"),
    
    ("Paulo Dybala", "Laguna Larga", "SD", "Joya", "Instituto"),
    
    ("Antoine Griezmann", "Mâcon", "SD", "Principito", "Real Sociedad"),
    ("Koke", "Madrid", "MC", "Capitán", "Atleti"),
    ("Jan Oblak", "Škofja Loka", "POR", "Muro", "Olimpija"),
    ("Julián Álvarez", "Calchín", "DC", "Araña", "River"),
    
    ("Neymar", "Mogi das Cruzes", "EI", "Ney", "Santos"),
    ("Cristiano Ronaldo", "Funchal", "DC", "Siuuu", "Sporting"),
    ("Lionel Messi", "Rosario", "DC", "Cabra", "Barça"),
    ("Karim Benzema", "Lyon", "DC", "Nueve", "Lyon"),
    ("N'Golo Kanté", "París", "MCD", "Pulmón", "Boulogne"),
    ("Riyad Mahrez", "Sarcelles", "ED", "Control", "Quimper"),
    ("Sadio Mané", "Bambali", "EI", "Humilde", "Metz"),

    ("Dusan Vlahovic", "Belgrado", "DC", "DV9", "Partizan"),
    ("Gleison Bremer", "Itapitanga", "DFC", "Roca", "Desportivo"),
    ("Teun Koopmeiners", "Castricum", "MC", "General", "AZ"),
    
    ("Xavi Simons", "Ámsterdam", "MCO", "Rizos", "PSG"),
    ("Dani Olmo", "Terrassa", "MCO", "Time", "Dinamo"), 
    
    ("Nico Williams", "Pamplona", "EI", "Cohete", "Bilbao"),
    ("Oihan Sancet", "Pamplona", "MCO", "Ciervo", "Bilbao"),
    ("Unai Simón", "Murgia", "POR", "Zamora", "Basconia"),
    
    ("Mikel Merino", "Pamplona", "MC", "Conde", "Osasuna"),
    ("Mikel Oyarzabal", "Eibar", "EI", "Piegrande", "Real"),
    ("Martin Zubimendi", "San Sebastián", "MCD", "Zubi", "Real"),
    
    ("Takefusa Kubo", "Kawasaki", "ED", "Take", "Tokyo"),
    
    ("Viktor Gyökeres", "Estocolmo", "DC", "Máscara", "Brommapojkarna"),
    ("Ousmane Diomande", "Abiyán", "DFC", "Diamante", "Midtjylland"),
    
    ("Diogo Costa", "Rothrist", "POR", "Muro", "Porto"),
    
    ("Orkun Kökcü", "Haarlem", "MC", "Maestro", "Groningen"),
    ("Angel Di Maria", "Rosario", "ED", "Fideo", "Rosario"),
    
    ("Santiago Giménez", "Buenos Aires", "DC", "Bebote", "Cruz Azul"),
]

# Parsing current stars
current_stars_list = []
for p in current_stars_data:
    current_stars_list.append({'word': p[0], 'hints': [p[1], p[2], p[3], p[4]]})

# Parsing logic for legends
legends_list = []
for name, hints in LEGEND_HINTS.items():
    legends_list.append({'word': name, 'hints': hints})

# Combine lists
all_new_players = legends_list + current_stars_list

# Format as JS
js_content = "const EXTENSION_DATA_9 = {\n"
js_content += "    'Celebridades': [\n"
for player in all_new_players:
    # Escape single quotes in names/hints for JS safety
    word = player['word'].replace("'", "\\'")
    hints = [h.replace("'", "\\'") for h in player['hints']]
    js_content += f"        {{ word: '{word}', hints: {hints} }},\n"
js_content += "    ],\n"
js_content += "    'Fútbol': [\n"
for player in all_new_players:
    # Escape single quotes in names/hints for JS safety
    word = player['word'].replace("'", "\\'")
    hints = [h.replace("'", "\\'") for h in player['hints']]
    js_content += f"        {{ word: '{word}', hints: {hints} }},\n"
js_content += "    ]\n"
js_content += "};\n\n"
js_content += "// MERGE LOGIC 9\n"
js_content += "for (let category in EXTENSION_DATA_9) {\n"
js_content += "    if (DATA[category]) {\n"
js_content += "        DATA[category] = DATA[category].concat(EXTENSION_DATA_9[category]);\n"
js_content += "    } else {\n"
js_content += "        DATA[category] = EXTENSION_DATA_9[category];\n"
js_content += "    }\n"
js_content += "}\n\n"

# Read existing file
file_path = r'c:\Users\Usuario\Documents\Impostor\js\data.js'
try:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Determine insertion point - REPLACE EXTENSION_DATA_9 block
    start_marker = "const EXTENSION_DATA_9 = {"
    start_pos = content.find(start_marker)
    final_dedup_pos = content.find("// FINAL DEDUPLICATION AND CLEANUP")
    
    if start_pos != -1 and final_dedup_pos != -1:
        # Replace the entire block
        new_content = content[:start_pos] + js_content + content[final_dedup_pos:]
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Successfully updated players with DEBUT TEAM hints. Total: {len(all_new_players)} players.")
    else:
        print("Error: Could not find block to replace. Please check file structure.")

except FileNotFoundError:
    print(f"Error: File not found at {file_path}")
except Exception as e:
    print(f"Error: {e}")
