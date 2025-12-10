import React from 'react';
import { Link } from 'react-router-dom';
import './ArticleCard.css';

function ArticleCard({ article, featured = false }) {
	const formatDateForDisplay = (dateString) => {
		const date = new Date(dateString);
		const months = [
			'JANUARY',
			'FEBRUARY',
			'MARCH',
			'APRIL',
			'MAY',
			'JUNE',
			'JULY',
			'AUGUST',
			'SEPTEMBER',
			'OCTOBER',
			'NOVEMBER',
			'DECEMBER',
		];
		const month = months[date.getMonth()];
		const day = date.getDate();
		const year = date.getFullYear();

		return `${month} ${day}, ${year}`;
	};

	const getPreview = (content) => {
		if (!content) return '';
		const firstParagraph = content.split('\n\n')[0] || content.split('\n')[0];
		const preview = firstParagraph.substring(0, 150);
		const lastPeriod = preview.lastIndexOf('.');
		if (lastPeriod > 80) {
			return preview.substring(0, lastPeriod + 1);
		}
		return preview + '...';
	};

	return (
		<article className={`article-card ${featured ? 'featured-card' : ''}`}>
			<Link
				to={`/article/${article.id}`}
				className='article-card-link'>
				<div className='card-header'>
					<div className='article-card-date'>
						{formatDateForDisplay(article.created_at)}
					</div>
					{featured && <span className='featured-badge'>New Article</span>}
				</div>
				<h3 className='article-card-title'>{article.title}</h3>
				{article.content && (
					<p className='article-card-preview'>{getPreview(article.content)}</p>
				)}
				<div className='card-footer'>
					<span className='read-more'>Read more →</span>
				</div>
			</Link>
		</article>
	);
}

export default ArticleCard;
