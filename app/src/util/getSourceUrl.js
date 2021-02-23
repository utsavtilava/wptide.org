/**
 * External Dependencies.
 */
const fetch = require('node-fetch');

/**
 * Checks if a downloadable ZIP archive for a specific version of a
 * theme or plugin exists on WordPress.org and returns the Source URL.
 *
 * @param   {string}                  type    The project type. One of `theme` or `plugin`.
 * @param   {string}                  slug    The theme or plugin slug.
 * @param   {string}                  version The theme or plugin version.
 * @returns {Promise<string|boolean>}         Return the source URL or false.
 */
const getSourceUrl = async (type, slug, version) => {
    try {
        if (!type || !slug || !version) {
            return false;
        }
        const url = `https://downloads.wordpress.org/${type}/${slug}.${version}.zip`;
        const fallback = `https://downloads.wordpress.org/${type}/${slug}.zip`;
        const opts = {
            method: 'HEAD',
        };
        let response = await fetch(url, opts);
        if (response.ok) {
            return url;
        }
        response = await fetch(fallback, opts);
        if (response.ok) {
            return fallback;
        }
        throw new Error(`Invalid Source URL ${fallback}:`);
    } catch (err) {
        // Helps to debug the server logs on GCP.
        console.error(err);
        return false;
    }
};

module.exports = {
    getSourceUrl,
};
