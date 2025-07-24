import React from "react";
import PropTypes from "prop-types";

/**
 * Composant Card BEM pour affichage d'un post
 * @param {Object} props
 * @param {string} props.title - Titre du post
 * @param {string} props.content - Contenu HTML ou texte
 * @param {string[]} [props.tags] - Liste des tags
 * @param {string} [props.author] - Auteur
 * @param {string} [props.date] - Date de publication
 * @param {boolean} [props.contrast] - Active le mode contrasté
 * @param {React.ReactNode} [props.children] - Contenu additionnel
 */
export default function Card({
  title,
  content,
  tags = [],
  author,
  date,
  contrast = false,
  children,
  ...rest
}) {
  return (
    <article
      className={`post${contrast ? " post--contrast" : ""}`}
      itemScope
      itemType="http://schema.org/BlogPosting"
      aria-labelledby="post-title"
      {...rest}
    >
      <header className="post__header">
        <h2 className="post__header-title" id="post-title" itemProp="headline">
          {title}
        </h2>
        <div className="post__header-meta" itemProp="author" itemScope itemType="http://schema.org/Person">
          {author && <span itemProp="name">{author}</span>}
          {date && (
            <time dateTime={date} itemProp="datePublished" style={{marginLeft: author ? 8 : 0}}>
              {date}
            </time>
          )}
        </div>
      </header>
      <div className="post__content" itemProp="articleBody">
        {content}
      </div>
      {tags && tags.length > 0 && (
        <div className="post__tags">
          {tags.map((tag, i) => (
            <span className="post__tags-item" key={i} itemProp="keywords">{tag}</span>
          ))}
        </div>
      )}
      {children}
    </article>
  );
}

Card.propTypes = {
  title: PropTypes.string.isRequired,
  content: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  tags: PropTypes.arrayOf(PropTypes.string),
  author: PropTypes.string,
  date: PropTypes.string,
  contrast: PropTypes.bool,
  children: PropTypes.node,
};
