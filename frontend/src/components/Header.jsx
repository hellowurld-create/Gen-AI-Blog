import './Header.css';

function Header() {
	return (
		<header className='app-header'>
			<div className='header-container'>
				<div className='header-brand'>
					<a
						href='/'
						className='brand-logo'>
						GenAI.
					</a>
				</div>
			</div>
		</header>
	);
}

export default Header;
