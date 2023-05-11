import pages from './pages';
import('./styles.css');

const pageNames = ['login', 'main', 'profile'];

document.addEventListener('click', () => {
    let page =  getRandomElement(pageNames);
    pages.openPage(page);
});
