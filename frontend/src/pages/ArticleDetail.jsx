import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getArticle } from '../api/client';
import ErrorMessage from '../components/ErrorMessage';
import LoadingSpinner from '../components/LoadingSpinner';
import './ArticleDetail.css';

function ArticleDetail() {
	const { id } = useParams();
	const [article, setArticle] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		fetchArticle();
	}, [id]);

	const fetchArticle = async () => {
		try {
			setLoading(true);
			const data = await getArticle(id);
			setArticle(data);
			setError(null);
		} catch (err) {
			setError('Failed to load article. Please try again later.');
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

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
		const hours = date.getHours();
		const minutes = date.getMinutes();
		const ampm = hours >= 12 ? 'PM' : 'AM';
		const displayHours = hours % 12 || 12;
		const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;

		return `${month} ${day}, ${year}, ${displayHours}:${displayMinutes} ${ampm}`;
	};

	const formatContent = (content) => {
		if (!content) return '';

		let paragraphs = content.split(/\n\n+/);
		if (paragraphs.length === 1) {
			paragraphs = content.split(/\n/);
		}
		paragraphs = paragraphs.filter((p) => p.trim());

		return paragraphs.map((paragraph, index) => {
			const trimmed = paragraph.trim();
			if (!trimmed) return null;

			if (index === 3) {
				const firstChar = trimmed.charAt(0);
				const rest = trimmed.substring(1);
				return (
					<p
						key={index}
						className='article-paragraph first-paragraph'>
						<span className='drop-cap'>{firstChar}</span>
						{rest}
					</p>
				);
			}

			const isHeading =
				trimmed.length < 80 &&
				(/^\d+\.\s+[A-Z]/.test(trimmed) ||
					(trimmed === trimmed.toUpperCase() &&
						trimmed.length > 5 &&
						trimmed.length < 50));

			if (isHeading) {
				return (
					<h3
						key={index}
						className='article-subheading'>
						{trimmed}
					</h3>
				);
			}

			return (
				<p
					key={index}
					className='article-paragraph'>
					{trimmed}
				</p>
			);
		});
	};

	if (loading) {
		return <LoadingSpinner message='Loading article...' />;
	}

	if (error || !article) {
		return (
			<ErrorMessage
				message={error || 'Article not found'}
				showBackLink={true}
			/>
		);
	}

	return (
		<div className='article-detail-page'>
			<article className='article-content'>
				<header className='article-header'>
					<div className='article-date'>
						{formatDateForDisplay(article.created_at)}
					</div>
					<h1 className='article-title'>{article.title}</h1>

					<div className='author-block'>
						<div className='author-avatar'>
							<div className='avatar-circle'>
								{article.title.charAt(0).toUpperCase()}
							</div>
						</div>
						<div className='author-info'>
							<div className='author-name'>Auto-Generated Blog</div>
							<div className='author-title'>History Enthusiast & Writer</div>
						</div>
					</div>
				</header>

				<div className='article-body'>
					<div className='article-text'>{formatContent(article.content)}</div>
				</div>
			</article>
		</div>
	);
}

export default ArticleDetail;
