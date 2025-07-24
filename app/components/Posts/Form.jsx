// Formulaire DRY pour créer ou modifier un post
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
// import styles from './Post/Post.module.scss';

export default function PostForm({ initial, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({ title: '', content: '', tags: '' });
  useEffect(() => {
    if (initial) {
      setForm({
        title: initial.title || '',
        content: initial.content || '',
        tags: initial.tags ? initial.tags.join(', ') : ''
      });
    } else {
      setForm({ title: '', content: '', tags: '' });
    }
  }, [initial]);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    onSubmit({
      ...form,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean)
    });
  };

  return (
    <form className={'post__form'} onSubmit={handleSubmit} aria-label={initial ? 'Modifier le post' : 'Créer un post'}>
      <div className={'post__form-row'}>
        <input
          className={'post__form-input'}
          name="title"
          placeholder="Titre"
          value={form.title}
          onChange={handleChange}
          required
          aria-label="Titre du post"
        />
      </div>
      <div className={'post__form-row'}>
        <textarea
          className={'post__form-textarea'}
          name="content"
          placeholder="Contenu"
          value={form.content}
          onChange={handleChange}
          required
          aria-label="Contenu du post"
        />
      </div>
      <div className={'post__form-row'}>
        <input
          className={'post__form-input'}
          name="tags"
          placeholder="Tags (séparés par des virgules)"
          value={form.tags}
          onChange={handleChange}
          aria-label="Tags du post"
        />
      </div>
      <div className={'post__form-actions'}>
        <button type="submit" className={'post__form-btn'} disabled={loading}>
          {initial ? 'Mettre à jour' : 'Créer'}
        </button>
        {initial && (
          <button type="button" className={'post__form-btn'} onClick={onCancel} disabled={loading}>
            Annuler
          </button>
        )}
      </div>
    </form>
  );
}

PostForm.propTypes = {
  initial: PropTypes.shape({
    title: PropTypes.string,
    content: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string)
  }),
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
  loading: PropTypes.bool
};
