/* eslint-disable no-param-reassign */
/* eslint-disable react/no-danger */
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { GetStaticPaths, GetStaticProps } from 'next';
import { useRouter } from 'next/router';

import { RichText } from 'prismic-dom';
import { FiCalendar, FiUser, FiClock } from 'react-icons/fi';
import Head from 'next/head';
import { useCallback } from 'react';
import Header from '../../components/Header';
import { getPrismicClient } from '../../services/prismic';

import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter();

  const formatedDate = useCallback(() => {
    return format(new Date(post.first_publication_date), 'dd MMM yyyy', {
      locale: ptBR,
    });
  }, [post]);

  const readingTime = useCallback(() => {
    const readHumanTime = 200;
    const wordAmount = post.data.content.reduce((acc, currentPost) => {
      acc += currentPost.heading.length;

      currentPost.body.forEach(b => {
        const wolrdArray = b.text.split(' ');
        acc += wolrdArray.length;
      });

      return acc;
    }, 0);

    const readTime = Math.ceil(wordAmount / readHumanTime);
    return readTime;
  }, [post]);

  if (router.isFallback) {
    return <div>Carregando...</div>;
  }

  return (
    <>
      <Head>
        <title>{post.data.title}</title>
      </Head>
      <Header />

      <article className={styles.post}>
        {post.data.banner.url ? (
          <img src={post.data.banner.url} alt={post.data.title} />
        ) : (
          ''
        )}
        <section>
          <h1>{post.data.title}</h1>
          <header>
            <FiCalendar />
            <span>{formatedDate()}</span>
            <FiUser />
            <span>{post.data.author}</span>
            <FiClock />
            <span>{`${readingTime()} min`} </span>
          </header>
          {post.data.content.map(cont => (
            <div key={cont.heading}>
              <h3>{cont.heading}</h3>
              <div
                dangerouslySetInnerHTML={{ __html: RichText.asHtml(cont.body) }}
              />
            </div>
          ))}
        </section>
      </article>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query('');

  const teste = posts.results.map(post => {
    return {
      params: { slug: post.uid },
    };
  });

  return {
    paths: [...teste],
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async context => {
  const { slug } = context.params;

  const prismic = getPrismicClient();

  const response = await prismic.getByUID('posts', String(slug), {});

  return {
    props: {
      post: response,
    },
    revalidate: 60 * 60, // 60 minutes
  };
};
