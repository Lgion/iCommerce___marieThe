

{/* Commentaires */}
export default ({comments,renderStars}) => <section className="services-page__comments">
    <h2 className="services-page__comments-title">Avis Clients</h2>
    <ul className="services-page__comments-list">
    {comments.length > 0 ? (
        comments.map((comment) => (
        <li key={comment.id} className="services-page__comments-item">
            <div className="services-page__comments-item-header">
            <span className="services-page__comments-item-header-user">
                {comment.user?.email || 'Utilisateur anonyme'}
            </span>
            {comment.rating && (
                <div className="services-page__comments-item-header-rating">
                {renderStars(comment.rating)}
                </div>
            )}
            </div>
            <p className="services-page__comments-item-text">{comment.text}</p>
            <p className="services-page__comments-item-date">
            {new Date(comment.createdAt).toLocaleDateString('fr-FR')}
            </p>
        </li>
        ))
    ) : (
        <li className="services-page__comments-item">
        <p className="services-page__comments-item-text">
            Aucun commentaire pour le moment. Soyez le premier à laisser un avis !
        </p>
        </li>
    )}
    </ul>
</section>