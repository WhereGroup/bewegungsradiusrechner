curl "https://overpass-api.de/api/interpreter?data=%0A%5Bout%3Ajson%5D%5Btimeout%3A60%5D%3B%0Aarea%5B%22name%22%3D%22Deutschland%22%5D-%3E.boundaryarea%3B%0A%28%20%20%0A%20%20node%28area.boundaryarea%29%5B%22healthcare%3Aspeciality%22%3D%22vaccination%22%5D%3B%0A%29%3B%0A%0Aout%20body%3B%0A%3E%3B%0Aout%20skel%20qt%3B" > build/vaccination.json