# Install OSRM depencies
`sudo apt install -y build-essential cmake pkg-config \
    libboost-all-dev libprotobuf-dev protobuf-compiler \
    liblua5.3-dev libtbb-dev libstxxl-dev libstxxl1v5 \
    libosmpbf-dev libbz2-dev zlib1g-dev libzip-dev git
`

# Clone OSRM
`git clone https://github.com/Project-OSRM/osrm-backend.git
cd osrm-backend
mkdir build
cd build
`

# Build OSRM
`cmake ..
cmake --build .
sudo cmake --build . --target install
`

# Download the needed maps 
https://download.geofabrik.de

#  If more than one map combine the maps
`cd ~/osrm`

`sudo apt install osmium-tool`
`osmium merge \
  rheinland-pfalz-260420.osm.pbf \
  saarland-260420.osm.pbf \
  belgium-260420.osm.pbf \
  lorraine-260420.osm.pbf \
  luxembourg-260420.osm.pbf \
  nordrhein-westfalen-260420.osm.pbf \
  -o merged-europe.osm.pbf`

# Process the map
`cd ~/osrm`
`osrm-extract -p /usr/local/share/osrm/profiles/car.lua merged-europe.osm.pbf
osrm-partition merged-europe.osrm
osrm-customize merged-europe.osrm`

# Run the server
`cd ~/osrm
osrm-routed --algorithm mld merged-europe.osrm`

http://localhost:5000