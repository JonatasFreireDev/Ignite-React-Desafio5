/* eslint-disable prettier/prettier */
import { GetStaticProps } from 'next';
import Head from 'next/head';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { FiCalendar, FiUser } from 'react-icons/fi';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { getPrismicClient } from '../services/prismic';
import Header from '../components/Header';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination }: HomeProps) {
  const [posts, setPosts] = useState([] as Post[]);
  const [nextPage, setNextPage] = useState('');

  useEffect(() => {
    setPosts(postsPagination.results);
    setNextPage(postsPagination.next_page);
  }, [postsPagination]);

  const handleNewPost = useCallback(async () => {
    fetch(nextPage)
      .then(response => response.json())
      .then(data => {
        console.log(data);
        setNextPage(data.next_page);
        setPosts([...posts, ...data.results]);
      });
  }, [nextPage, posts]);

  return (
    <>
      <Head>
        <title>Home</title>
      </Head>
      <Header />
      <section className={styles.container}>
        {posts.map(post => (
          <div key={post.uid} className={styles.post}>
            <Link href={`/post/${post.uid}`}>
              <a>
                <h1>{post.data.title}</h1>
              </a>
            </Link>
            <p>{post.data.subtitle}</p>
            <div>
              <FiCalendar />
              <time>
                {format(new Date(post.first_publication_date), 'dd MMM yyyy', {
                  locale: ptBR,
                })}
              </time>
              <FiUser />
              <p>{post.data.author}</p>
            </div>
          </div>
        ))}
        {nextPage !== null ? (
          <button type="button" onClick={handleNewPost}>
            Carregar mais posts
          </button>
        ) : (
          ''
        )}
      </section>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const postsPagination = await prismic.query('', { pageSize: 1 });

  // const postsPagination = {
  //   next_page: postsResponse.next_page ? postsResponse.next_page : null,
  //   results: postsResponse.results.map(result => {
  //     return {
  //       ...result,
  //       first_publication_date: format(
  //         new Date(result.first_publication_date),
  //         'dd MMM yyyy',
  //         { locale: ptBR }
  //       ),
  //     };
  //   }),
  // };

  return {
    props: {
      postsPagination,
    },
    revalidate: 60 * 60, // 60 minutes
  };
};
