"""Stub saxonche - minimise le bundle Vercel Python.

La lib factur-x Akretion v4.2 fait `import saxonche` au top de
facturx.py, mais saxonche n'est utilisee QUE dans la fonction
xml_check_schematron que notre code n'appelle jamais (on passe
check_schematron=False).

saxonche pese ~100 MB (DLL Saxon HE C library) ce qui depasse la
limite bundle Vercel Python de 250 MB.

Ce stub vide satisfait l'import statique top-level de facturx.py
sans charger la vraie lib. Si quelqu'un appelle accidentellement
xml_check_schematron, il aura une AttributeError claire sur
PySaxonProcessor, ce qui est preferable a un crash silencieux.
"""

# Intentionnellement vide.
# Si on doit ajouter des stubs de compat plus tard, les mettre ici.
