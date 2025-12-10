import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getArticles } from '../api/client';
import ArticleCard from '../components/ArticleCard';
import ErrorMessage from '../components/ErrorMessage';
import LoadingSpinner from '../components/LoadingSpinner';
import './ArticleList.css';

function ArticleList() {
	const [articles, setArticles] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		fetchArticles();
	}, []);

	const fetchArticles = async () => {
		try {
			setLoading(true);
			const data = await getArticles();
			const sorted = data.sort(
				(a, b) => new Date(b.created_at) - new Date(a.created_at)
			);
			setArticles(sorted);
			setError(null);
		} catch (err) {
			setError('Failed to load articles. Please try again later.');
			console.error(err);
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return <LoadingSpinner message='Loading articles...' />;
	}

	if (error) {
		return (
			<ErrorMessage
				message={error}
				onRetry={fetchArticles}
			/>
		);
	}

	const featuredArticle = articles.length > 0 ? articles[0] : null;
	const latestArticles = articles.slice(1);

	return (
		<div className='article-list-page'>
			<div className='article-list-container'>
				{articles.length === 0 ? (
					<div className='empty-state'>
						<h2>No articles yet</h2>
						<p>
							New articles are generated daily at 2:00 PM WAT. Check back soon!
						</p>
					</div>
				) : (
					<>
						{featuredArticle && (
							<section className='featured-section'>
								<div className='section-header'>
									<h2 className='section-title'>New</h2>
									<div className='newspaper-line'></div>
								</div>
								<ArticleCard
									article={featuredArticle}
									featured={true}
								/>
							</section>
						)}

						{latestArticles.length > 0 && (
							<section className='latest-section'>
								<div className='section-header'>
									<h2 className='section-title'>Others</h2>
									<div className='newspaper-line'></div>
								</div>
								<div className='articles-grid'>
									{latestArticles.map((article) => (
										<ArticleCard
											key={article.id}
											article={article}
										/>
									))}
								</div>
							</section>
						)}
					</>
				)}
			</div>
		</div>
	);
}

export default ArticleList;
