"use client"

// Page Posts : CRUD complet, BEM, SCSS, accessibilité, microdata, gestion API Next.js
import React, { useEffect, useState } from 'react';
import styles from './Posts.module.scss';
import Post from './Post';
import PostForm from './Form';
import Card from './Card';

const API_URL = '/api/Post';

export default function Posts() {
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState({ title: '', content: '', tags: '' });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch posts
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      setPosts(await res.json());
    } catch (e) {
      setError('Erreur lors du chargement des posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, []);

  // Handle form input
  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Create or update post
  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const method = editId ? 'PUT' : 'POST';
      const body = {
        ...form,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        ...(editId ? { id: editId } : {})
      };
      const res = await fetch(API_URL, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error('Erreur API');
      setForm({ title: '', content: '', tags: '' });
      setEditId(null);
      fetchPosts();
    } catch (e) {
      setError('Erreur lors de l’enregistrement du post');
    } finally {
      setLoading(false);
    }
  };

  // Delete post
  const handleDelete = async id => {
    if (!window.confirm('Supprimer ce post ?')) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_URL, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (!res.ok) throw new Error('Erreur API');
      fetchPosts();
    } catch (e) {
      setError('Erreur lors de la suppression');
    } finally {
      setLoading(false);
    }
  };

  // Edit post
  const handleEdit = post => {
    setForm({
      title: post.title,
      content: post.content,
      tags: post.tags ? post.tags.join(', ') : ''
    });
    setEditId(post.id);
  };

  // Cancel edit
  const handleCancel = () => {
    setForm({ title: '', content: '', tags: '' });
    setEditId(null);
  };

  return (
    <main className={styles['posts']} itemScope itemType="http://schema.org/CollectionPage">
      <div className={styles['posts__container']}>
        <div className={styles['posts__header']}>
          <span className={styles['posts__header-title']}>Posts</span>
        </div>
        <PostForm
          initial={editId ? posts.find(p => p.id === editId) : null}
          onSubmit={async postData => {
            setLoading(true);
            setError(null);
            try {
              const method = editId ? 'PUT' : 'POST';
              const body = {
                ...postData,
                ...(editId ? { id: editId } : {})
              };
              const res = await fetch(API_URL, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
              });
              if (!res.ok) throw new Error('Erreur API');
              setForm({ title: '', content: '', tags: '' });
              setEditId(null);
              fetchPosts();
            } catch (e) {
              setError('Erreur lors de l’enregistrement du post');
            } finally {
              setLoading(false);
            }
          }}
          onCancel={editId ? handleCancel : undefined}
          loading={loading}
        />
        {error && <div style={{color:'#d92d2d',marginBottom:'1rem'}} role="alert">{error}</div>}
        <div className={styles['posts__list']} aria-live="polite">
          {loading && <span>Chargement…</span>}
          {!loading && posts.length === 0 && <span>Aucun post pour l’instant.</span>}
          {posts.map(post => (
            <Card
              key={post.id}
              title={post.title}
              content={post.content}
              tags={post.tags}
              author={post.authorId}
              date={post.publishedAt}
            >
              <div style={{display:'flex',gap:'1rem',marginTop:'0.5rem'}}>
                <button className={'post__form-btn'} onClick={() => handleEdit(post)} aria-label="Modifier ce post">Modifier</button>
                <button className={'post__form-btn post__form-btn--danger'} onClick={() => handleDelete(post.id)} aria-label="Supprimer ce post">Supprimer</button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
