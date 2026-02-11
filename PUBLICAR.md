# 🌍 CÓMO PUBLICAR TU JUEGO EN INTERNET

Aquí tienes las dos formas más fáciles de hacer que tu juego esté disponible para todo el mundo.
**AMBAS opciones permiten instalar la App en el móvil y jugar SIN INTERNET.**

---

## 🚀 OPCIÓN 1: NETLIFY (La más fácil y rápida)
**Ideal si no quieres usar comandos ni configurar cosas complicadas.**

1.  Entra en **[app.netlify.com/drop](https://app.netlify.com/drop)**.
2.  Arrastra la CARPETA ENTERA de tu proyecto (`Impostor`) dentro del recuadro que dice "Drag and drop your site folder here".
3.  Espera unos segundos.
4.  ¡Listo! Te darán un enlace (ej: `random-name-123.netlify.app`).
5.  Puedes cambiar el nombre del enlace en "Site Settings" -> "Change site name".

---

## 🐱 OPCIÓN 2: GITHUB PAGES (La más profesional)
**Ideal si quieres tener el código guardado y actualizarlo fácilmente.**

### Paso 1: Preparar los archivos
1.  He creado un archivo llamado **`preparar_git.bat`**. Hazle doble clic.
2.  Esto preparará tu carpeta para ser subida.

### Paso 2: Crear el repositorio en GitHub
1.  Ve a **[github.com/new](https://github.com/new)** (necesitas cuenta).
2.  Ponle nombre al repositorio (ej: `impostar-game`).
3.  Asegúrate de que esté en **"Public"**.
4.  Dale a "Create repository".

### Paso 3: Subir el código
1.  En la página que aparece después de crear el repo, copia las líneas que salen bajo **"…or push an existing repository from the command line"**.
    -   Suelen ser 3 líneas que empiezan por `git remote add...`.
2.  Abre una terminal en tu carpeta (o abre `start.bat` y ciérralo con Ctrl+C para quedarte en la terminal).
3.  Pega esas líneas y dale a Enter.
4.  Tu código se subirá.

### Paso 4: Activar la Web
1.  En tu repositorio de GitHub, ve a **Settings** (arriba a la derecha).
2.  En el menú de la izquierda, busca **Pages**.
3.  En "Source", selecciona **`main`** (o `master`) y dale a **Save**.
4.  En unos minutos, tu web estará lista en: `https://TU-USUARIO.github.io/impostar-game/`

---

## 📲 IMPORTANTE: JUGAR EN EL MÓVIL
Una vez publicado, cuando entres con el móvil:
1.  Dale a "Compartir" (iOS) o al menú de 3 puntos (Android).
2.  Elige **"Añadir a pantalla de inicio"**.
3.  El juego se instalará como una app completa y funcionará a pantalla completa.
