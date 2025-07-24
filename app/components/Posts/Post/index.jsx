"use client"

/**
 * Composant Post
 * @param {Object} props
 * @param {Object} props.data - Données du post (id, title, content, tags, authorId, publishedAt)
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import PostForm from '../Form';

/**
 * Composant Post CRUD BEM (update/delete/create)
 * @param {Object} props
 * @param {Object} props.data - Données du post
 * @param {Function} props.onUpdate - callback (post) => void
 * @param {Function} props.onDelete - callback (id) => void
 * @param {Boolean} props.loading
 */
export default function Post({ data, onUpdate, onDelete, loading }) {
  const [editing, setEditing] = useState(false);

  if (!data) return null;

  // Affichage du formulaire d'édition
  if (editing) {
    return (
      <div className={'post'}>
        <PostForm
          initial={data}
          onSubmit={post => { onUpdate && onUpdate({ ...data, ...post }); setEditing(false); }}
          onCancel={() => setEditing(false)}
          loading={loading}
        />
      </div>
    );
  }

  // Affichage du post en mode lecture
  return (
    <article
      className={'post'}
      itemScope
      itemType="http://schema.org/BlogPosting"
      aria-labelledby={`post-title-${data.id}`}
    >
      <header className={'post__header'}>
        <h2
          className={'post__header-title'}
          id={`post-title-${data.id}`}
          itemProp="headline"
        >
          {data.title}
        </h2>
        <div className={'post__header-meta'}>
          <span itemProp="author" itemScope itemType="http://schema.org/Person">
            Auteur : <span itemProp="name">{data.authorId || 'Inconnu'}</span>
          </span>
          <span> &mdash; </span>
          <time dateTime={data.publishedAt} itemProp="datePublished">
            {data.publishedAt ? new Date(data.publishedAt).toLocaleDateString() : 'Date inconnue'}
          </time>
        </div>
      </header>
      <section className={'post__content'} itemProp="articleBody">
        {data.content}
      </section>
      {data.tags && data.tags.length > 0 && (
        <footer className={'post__tags'} aria-label="Tags">
          {data.tags.map((tag, i) => (
            <span key={i} className={'post__tags-item'} itemProp="keywords">
              #{tag}
            </span>
          ))}
        </footer>
      )}
      <div style={{display:'flex',gap:'1rem',marginTop:'0.5rem'}}>
        {onUpdate && (
          <button className={'post__form-btn'} onClick={() => setEditing(true)} disabled={loading} aria-label="Modifier ce post">Modifier</button>
        )}
        {onDelete && (
          <button className={'post__form-btn' + ' ' + 'post__form-btn--danger'} onClick={() => onDelete(data.id)} disabled={loading} aria-label="Supprimer ce post">Supprimer</button>
        )}
      </div>
    </article>
  );
}


Post.propTypes = {
  data: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    title: PropTypes.string,
    content: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string),
    authorId: PropTypes.string,
    publishedAt: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  })
};