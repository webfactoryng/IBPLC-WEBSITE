<?php

use Twig\Environment;
use Twig\Error\LoaderError;
use Twig\Error\RuntimeError;
use Twig\Markup;
use Twig\Sandbox\SecurityError;
use Twig\Sandbox\SecurityNotAllowedTagError;
use Twig\Sandbox\SecurityNotAllowedFilterError;
use Twig\Sandbox\SecurityNotAllowedFunctionError;
use Twig\Source;
use Twig\Template;

/* __string_template__89faa9852f605a6444c3f57f1123f4ba957129648891f3721fb21151b0c13460 */
class __TwigTemplate_6a0a92077baa4b3695d16538cfb47a8d616945160d5c5e2e968fb0a3e26101bb extends \Twig\Template
{
    public function __construct(Environment $env)
    {
        parent::__construct($env);

        $this->parent = false;

        $this->blocks = [
        ];
        $this->sandbox = $this->env->getExtension('\Twig\Extension\SandboxExtension');
        $tags = [];
        $filters = ["escape" => 8];
        $functions = [];

        try {
            $this->sandbox->checkSecurity(
                [],
                ['escape'],
                []
            );
        } catch (SecurityError $e) {
            $e->setSourceContext($this->getSourceContext());

            if ($e instanceof SecurityNotAllowedTagError && isset($tags[$e->getTagName()])) {
                $e->setTemplateLine($tags[$e->getTagName()]);
            } elseif ($e instanceof SecurityNotAllowedFilterError && isset($filters[$e->getFilterName()])) {
                $e->setTemplateLine($filters[$e->getFilterName()]);
            } elseif ($e instanceof SecurityNotAllowedFunctionError && isset($functions[$e->getFunctionName()])) {
                $e->setTemplateLine($functions[$e->getFunctionName()]);
            }

            throw $e;
        }

    }

    protected function doDisplay(array $context, array $blocks = [])
    {
        // line 1
        echo "<div class=\"card thumb\">
\t\t\t\t  <div class=\"card-inner\">
\t\t\t\t\t<div class=\"card-wrapper\">
\t\t\t\t\t\t
\t\t\t\t\t\t\t<div class=\"card-image\">
\t\t\t\t\t\t\t\t<div class=\"card-image-inner\">
\t\t\t\t\t\t\t\t  <div class=\"card-image-wrapper\">
\t\t\t\t\t\t\t<img alt=\"\" src=\"";
        // line 8
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(($context["field_image_upload"] ?? null)), "html", null, true);
        echo " \" data-srcset=\"\" class=\"image responsively-lazy\">
\t\t\t\t\t\t\t\t  </div>
\t\t\t\t\t\t\t\t</div>
\t\t\t\t\t\t\t</div>
\t\t\t\t\t\t
\t\t\t\t\t  <div class=\"card-body\">
\t\t\t\t\t\t  <h4 class=\"card-body--eyebrow eyebrow\">
\t\t\t\t\t\t\t";
        // line 15
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(($context["field_category"] ?? null)), "html", null, true);
        echo "
\t\t\t\t\t\t  </h4>
\t\t\t\t\t\t\t";
        // line 17
        echo $this->env->getExtension('Drupal\Core\Template\TwigExtension')->escapeFilter($this->env, $this->sandbox->ensureToStringAllowed(($context["title"] ?? null)), "html", null, true);
        echo " <br><br>
\t\t\t\t\t</div>
\t\t\t\t\t</div>
\t\t\t\t  </div>
</div>";
    }

    public function getTemplateName()
    {
        return "__string_template__89faa9852f605a6444c3f57f1123f4ba957129648891f3721fb21151b0c13460";
    }

    public function isTraitable()
    {
        return false;
    }

    public function getDebugInfo()
    {
        return array (  79 => 17,  74 => 15,  64 => 8,  55 => 1,);
    }

    /** @deprecated since 1.27 (to be removed in 2.0). Use getSourceContext() instead */
    public function getSource()
    {
        @trigger_error('The '.__METHOD__.' method is deprecated since version 1.27 and will be removed in 2.0. Use getSourceContext() instead.', E_USER_DEPRECATED);

        return $this->getSourceContext()->getCode();
    }

    public function getSourceContext()
    {
        return new Source("", "__string_template__89faa9852f605a6444c3f57f1123f4ba957129648891f3721fb21151b0c13460", "");
    }
}
