rem #!/bin/bash

# Fonction pour parcourir récursivement l'arborescence
function parcourir_arborescence() {
    # Parcours de tous les éléments dans le répertoire passé en paramètre
    for element in "$1"/*; do
        if [ -d "$element" ]; then
            # Si c'est un répertoire, appel récursif de la fonction
            parcourir_arborescence "$element"
        elif [ -f "$element" ]; then
            # Si c'est un fichier, effectuer more
            # echo "Contenu de $element :"
            grep "static getAccessorName(){ return " "$element" | awk '{split($0, elements); print elements[4]}' >> resAccessor.txt
            # echo "--------------------------------------"
        fi
    done
}

# Appel de la fonction pour commencer le parcours à partir du répertoire spécifié en paramètre
if [ -d "$1" ]; then
    echo "" > resAccessor.txt
    parcourir_arborescence "$1"
else
    echo "Usage: $0 <répertoire>"
    exit 1
fi
