<?php

/**
 * @file
 * Contains Drupal\visitors\Controller\Report\Node.
 */

namespace Drupal\visitors\Controller\Report;

use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Database\Query\Condition;
use Drupal\Core\Datetime\Date;
use Drupal\Core\Datetime\DateFormatterInterface;
use Drupal\Core\Form\FormBuilderInterface;
use Drupal\Core\Link;
use Drupal\Core\Url;
use Drupal\node\NodeInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

class Node extends ControllerBase {
  /**
   * The date service.
   *
   * @var \Drupal\Core\Datetime\DateFormatterInterface
   */
  protected $date;

  /**
   * The form builder service.
   *
   * @var \Drupal\Core\Form\FormBuilderInterface
   */
  protected $formBuilder;

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    return new static(
      $container->get('date.formatter'),
      $container->get('form_builder')
    );
  }

  /**
   * Constructs a Node object.
   *
   * @param \Drupal\Core\Datetime\DateFormatterInterface $date
   *   The date service.
   *
   * @param \Drupal\Core\Form\FormBuilderInterface $form_builder
   *   The form builder service.
   */
  public function __construct(DateFormatterInterface $date_formatter, FormBuilderInterface $form_builder) {
    $this->date        = $date_formatter;
    $this->formBuilder = $form_builder;
  }

  /**
   * Returns a recent hits page.
   *
   * @return array
   *   A render array representing the recent hits page content.
   */
  public function display(NodeInterface $node) {
    $form = $this->formBuilder->getForm('Drupal\visitors\Form\DateFilter');
    $header = $this->_getHeader();

    return array(
      'visitors_date_filter_form' => $form,
      'visitors_table' => array(
        '#type'  => 'table',
        '#header' => $header,
        '#rows'   => $this->_getData($header, $node),
      ),
      'visitors_pager' => array('#type' => 'pager')
    );
  }

  /**
   * Returns a table header configuration.
   *
   * @return array
   *   A render array representing the table header info.
   */
  protected function _getHeader() {
    return array(
      '#' => array(
        'data'      => t('#'),
      ),
      'visitors_id' => array(
        'data'      => t('ID'),
        'field'     => 'visitors_id',
        'specifier' => 'visitors_id',
        'class'     => array(RESPONSIVE_PRIORITY_LOW),
        'sort'      => 'desc',
      ),
      'visitors_date_time' => array(
        'data'      => t('Date'),
        'field'     => 'visitors_date_time',
        'specifier' => 'visitors_date_time',
        'class'     => array(RESPONSIVE_PRIORITY_LOW),
      ),
      'visitors_referer' => array(
        'data'      => t('Referer'),
        'field'     => 'visitors_referer',
        'specifier' => 'visitors_referer',
        'class'     => array(RESPONSIVE_PRIORITY_LOW),
      ),

      'u.name' => array(
        'data'      => t('User'),
        'field'     => 'u.name',
        'specifier' => 'u.name',
        'class'     => array(RESPONSIVE_PRIORITY_LOW),
      ),
      '' => array(
        'data'      => t('Operations'),
      ),
    );
  }

  /**
   * Returns a table content.
   *
   * @param array $header
   *   Table header configuration.
   *
   * @return array
   *   Array representing the table content.
   */
  protected function _getData($header, $node) {
  if ($node) {
    $items_per_page = \Drupal::config('visitors.config')->get('items_per_page');
    $query = \Drupal::database()->select('visitors', 'v')
      ->extend('Drupal\Core\Database\Query\PagerSelectExtender')
      ->extend('Drupal\Core\Database\Query\TableSortExtender');
    $query->leftJoin('users_field_data', 'u', 'u.uid=v.visitors_id');
    $query->fields(
      'v',
      array(
        'visitors_uid',
        'visitors_id',
        'visitors_date_time',
        'visitors_referer',
      )
    );


    $nid = (int) $node->id();
    $query->fields('u', array('name', 'uid'));
    $db_or = new Condition();
    $db_or->condition('v.visitors_path', '/node/' . $nid, '=');
    //@todo removed placeholder is this right?
    $db_or->condition(
      'v.visitors_path', '%/node/' . $nid."%", 'LIKE'
    );
    $query->condition($db_or);

    visitors_date_filter_sql_condition($query);
    $query->orderByHeader($header);
    $query->limit($items_per_page);

    $count_query = \Drupal::database()->select('visitors', 'v');
    $count_query->addExpression('COUNT(*)');
    $count_query->condition($db_or);
    visitors_date_filter_sql_condition($count_query);
    $query->setCountQuery($count_query);
    $results = $query->execute();
    $rows = array();

    $page = isset($_GET['page']) ? (int) $_GET['page'] : '';
    $i = 0 + $page * $items_per_page;
    $timezone =  drupal_get_user_timezone();

    foreach ($results as $data) {
      $user = \Drupal::entityTypeManager()->getStorage('user')->load($data->visitors_uid);
      $username = array(
        '#type' => 'username',
        '#account' => $user
      );
      $rows[] = array(
        ++$i,
        $data->visitors_id,
        $this->date->format($data->visitors_date_time, 'short'),
        !empty($data->visitors_referer) ? $data->visitors_referer : 'none',
        $user->getAccountName(),
        Link::fromTextAndUrl($this->t('details'),Url::fromRoute('visitors.hit_details',array("hit_id"=>$data->visitors_id)))
      );
    }

    return $rows;
  }
}
}

