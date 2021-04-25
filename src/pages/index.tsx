import { GetStaticProps } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { useContext } from 'react';

import { PlayerContext } from '../context/PlayerContext';
import { api } from '../services/api'
import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { convertDurationTimeToString } from '../utils/convertDurationTimeToString';

import styles from './home.module.scss';

type Episode = {
  id: string;
  title: string;
  thumbnail: string;
  members: string;
  duration: number;
  durationAsString: string;
  url: string;
  publishedAt: string;
}

type HomeProps = {
  lastedEpisodes: Episode[];
  allEpisodes: Episode[];
}

export default function Home({ lastedEpisodes, allEpisodes }: HomeProps) {
  const { play } =  useContext(PlayerContext);

  return (
    <div className={styles.homePage}>
      <section className={styles.lastedEpisodes}>
        <h2>Últimos Lançamentos</h2>
        <ul>
          {lastedEpisodes.map(episode => {
            return (
              <li key={episode.id}>
                <Image
                  width={192}
                  height={192}
                  src={episode.thumbnail}
                  alt={episode.title}
                  objectFit="cover"
                />

                <div className={styles.episodesDetails}>
                  <Link href={`/episodes/${episode.id}`}>
                    <a >{episode.title}</a>
                  </Link>
                  <p>{episode.members}</p>
                  <span> {episode.publishedAt} </span>
                  <span> {episode.durationAsString} </span>
                </div>

                <button type="button" onClick={()=> play(episode)}>
                  <img src="/play-green.svg" alt="Reproduzir" />
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className={styles.allEpisodes}>
        <h2>Todos os Episódios </h2>

        <table cellSpacing={0}>
          <thead>
            <tr>
              <th>Podcast</th>
              <th>Integrantes</th>
              <th>Data</th>
              <th>Duração</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {allEpisodes.map(epsiode => {
              return (
                <tr key={epsiode.id}>
                  <td style={{ width: 100 }}>
                    <Image
                      width={120}
                      height={120}
                      src={epsiode.thumbnail}
                      alt={epsiode.title}
                      objectFit="cover"
                    />
                  </td>
                  <td>
                    <Link href={`episodes/${epsiode.id}`}>
                      <a >{epsiode.title}</a>
                    </Link>
                  </td>
                  <td>{epsiode.members}</td>
                  <td style={{ width: 100 }}>{epsiode.publishedAt}</td>
                  <td>{epsiode.durationAsString}</td>
                  <td>
                    <button type="button">
                      <img src="/play-green.svg" alt="Reproduzir" />
                    </button>
                  </td>
                </tr>);
            })}
          </tbody>
        </table>
      </section>
    </div>

  );
}

export const getStaticProps: GetStaticProps = async () => {
  const { data } = await api.get('episodes', {
    params: {
      _limit: 12,
      _sort: 'published_at',
      _order: 'desc',
    }
  })

  const episodes = data.map(episode => {
    return {
      id: episode.id,
      title: episode.title,
      thumbnail: episode.thumbnail,
      members: episode.members,
      publishedAt: format(parseISO(episode.published_at), 'd MMM yy', { locale: ptBR }),
      duration: Number(episode.file.duration),
      durationAsString: convertDurationTimeToString(Number(episode.file.duration)),
      url: episode.file.url,
    }
  })

  const lastedEpisodes = episodes.slice(0, 2);
  const allEpisodes = episodes.slice(2, episodes.length);

  return {
    props: {
      lastedEpisodes,
      allEpisodes
    },

    revalidate: 60 * 60 * 8,
  }
}